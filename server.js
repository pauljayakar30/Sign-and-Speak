/**
 * Sign & Speak - Backend Server
 * 
 * This Express server provides:
 * - OpenAI GPT API proxy endpoints for AI features (with demo mode fallback)
 * - Parent-child pairing system for progress tracking
 * - Environment configuration endpoints
 * 
 * The React frontend runs separately on Vite dev server (port 5173) in development,
 * and this backend runs on port 3000. In production, both are deployed together.
 */

import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Gracefully handle invalid JSON request bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).send({ error: 'Invalid JSON body' });
  }
  next();
});

// Enable CORS for frontend requests
// Enable CORS for frontend requests
app.use(cors());

/**
 * Security: Redact sensitive API keys from logs
 * Masks OpenAI API keys (sk-... or sk-proj-...) to prevent accidental exposure in console logs
 */
function redact(s) {
  try {
    const str = String(s ?? '');
    return str
      .replace(/sk-[a-zA-Z0-9_-]{10,}/g, (m) => m.slice(0, 6) + '***REDACTED***')
      .replace(/sk-proj-[a-zA-Z0-9_-]{10,}/g, (m) => m.slice(0, 9) + '***REDACTED***');
  } catch { 
    return '[redacted]'; 
  }
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Demo mode: Enable if no API key is provided or explicitly requested
const DEMO_MODE = process.env.DEMO_MODE === '1' || !process.env.OPENAI_API_KEY;
if (!process.env.OPENAI_API_KEY) {
  console.warn('[Sign & Speak] Warning: OPENAI_API_KEY not set. Running in DEMO MODE with mock AI responses.');
}

// Configuration
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const MAX_TOKENS = Number(process.env.OPENAI_MAX_TOKENS || 150);
const DEMO_FALLBACK_ON_QUOTA = process.env.DEMO_FALLBACK_ON_QUOTA === '1';

/**
 * Health check endpoint
 */
app.get('/health', (_req, res) => res.send({ ok: true }));

/**
 * Environment status endpoint
 * Returns whether OpenAI API key is configured and if demo mode is active
 */
app.get('/env-ok', (_req, res) => {
  res.send({ 
    openaiKeyPresent: Boolean(process.env.OPENAI_API_KEY), 
    demoMode: DEMO_MODE 
  });
});

/**
 * Main OpenAI GPT endpoint
 * Accepts a prompt and returns an AI-generated response
 * Falls back to demo mode if no API key or on quota errors
 */
app.post('/ask-gpt', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).send({ error: 'Prompt is required' });
  }

  // Demo-mode generator (no network calls)
  function demoReply(p) {
    const lower = String(p || '').toLowerCase();
    if (lower.includes('story')) {
      return 'Once upon a time, an otter and a fox practiced signs together: (wave), (stop), and (milk). They cheered with a high-five and finished with a happy (ok)!';
    }
    if (lower.includes('weekly') || lower.includes('week')) {
      return '- Day 1: Pair the sign with the real action.\n- Day 2: Practice during play for 3 minutes.\n- Day 3: Celebrate any attempt with a sticker.';
    }
    if (lower.includes('daily')) {
      return '- Warm-up: 3 clear demonstrations.\n- Practice: 5 tries with praise.\n- Celebrate: star or sticker.';
    }
    if (lower.includes('insight') || lower.includes('tip')) {
      return 'Tip: Catch good attempts fast. Keep sessions short and positive. Pair the sign with the real object or action.';
    }
    return 'Here’s a quick idea: model the sign, say the word, and reward immediately. Short, fun, and frequent wins the day!';
  }

  if (DEMO_MODE) {
    return res.send({ response: demoReply(prompt), demo: true });
  }

  // helper to call OpenAI once
  async function callOnce() {
    const response = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'system', content: 'You are a helpful, supportive assistant for parents teaching basic signs to kids. Be concise, positive, and actionable. Avoid medical advice.' },
        { role: 'user', content: prompt }
      ],
    });
    return response.choices?.[0]?.message?.content ?? 'No response';
  }

  try {
    try {
      const text = await callOnce();
      return res.send({ response: text });
    } catch (error) {
      // Retry once on rate limits
      const msg = (error?.response?.data?.error?.message || error?.message || '').toLowerCase();
      if (error?.status === 429 && msg.includes('rate')) {
        await new Promise(r => setTimeout(r, 1200));
        const text = await callOnce();
        return res.send({ response: text });
      }
      // Auth/Key issues -> DEMO reply
      const authProblem = error?.status === 401 || error?.status === 403 || msg.includes('incorrect api key') || msg.includes('api key') || msg.includes('unauthorized');
      if (authProblem) {
        return res.send({ response: demoReply(prompt), demo: true });
      }
      // Quota fallback (optional)
      if (DEMO_FALLBACK_ON_QUOTA && (msg.includes('insufficient_quota') || msg.includes('quota') || msg.includes('billing'))) {
        return res.send({ response: 'Here’s a quick tip: Pair the MILK sign with the word and action. Say “milk,” show the sign, then hand over the milk. Keep it fun and repeat in short bursts.', demo: true });
      }
      throw error; // escalate to outer catch
    }
  } catch (error) {
    try { console.error('OpenAI API error:', error?.status || '', '(message hidden)') } catch {}
    res.status(500).send({ error: 'AI service temporarily unavailable. Please try again later.' });
  }
});

/**
 * Parent-Child Pairing System
 * 
 * Simple in-memory store for connecting parent dashboard with child's activity
 * In production, this should be replaced with a database (MongoDB, PostgreSQL, etc.)
 * 
 * Data structure: code -> { claimed: bool, feed: Array<{t: timestamp, type: string, payload: any}> }
 */
const pairs = new Map();

/** Generate a random 6-digit pairing code */
function randomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** POST /pair/generate - Generate a new pairing code (parent initiates) */
app.post('/pair/generate', (_req, res) => {
  let code = randomCode();
  while (pairs.has(code)) code = randomCode();
  pairs.set(code, { claimed: false, childId: null, parentId: null, feed: [] });
  res.send({ code });
});

/** POST /pair/claim - Child claims a pairing code */
/** POST /pair/claim - Child claims a pairing code */
app.post('/pair/claim', (req, res) => {
  const { code } = req.body || {};
  if (!code || !pairs.has(code)) return res.status(400).send({ error: 'Invalid code' });
  const p = pairs.get(code);
  if (p.claimed) return res.status(409).send({ error: 'Already claimed' });
  p.claimed = true;
  res.send({ ok: true });
});

/** GET /pair/status/:code - Check if a pairing code has been claimed */
app.get('/pair/status/:code', (req, res) => {
  const code = req.params.code;
  const p = pairs.get(code);
  if (!p) return res.status(404).send({ error: 'Not found' });
  res.send({ claimed: p.claimed });
});

/** POST /pair/event - Child sends activity event to parent's feed */
/** POST /pair/event - Child sends activity event to parent's feed */
app.post('/pair/event', (req, res) => {
  const { code, type } = req.body || {};
  const payload = req.body?.payload ?? (req.body?.value !== undefined ? { value: req.body.value } : undefined);
  if (!code || !pairs.has(code)) return res.status(400).send({ error: 'Invalid code' });
  const p = pairs.get(code);
  const entry = { t: Date.now(), type, payload };
  p.feed.unshift(entry);
  p.feed = p.feed.slice(0, 50); // Keep only last 50 events
  res.send({ ok: true });
});

/** GET /pair/feed/:code - Parent fetches activity feed */
app.get('/pair/feed/:code', (req, res) => {
  const code = req.params.code;
  const p = pairs.get(code);
  if (!p) return res.status(404).send({ error: 'Not found' });
  res.send({ feed: p.feed });
});

/**
 * Specialized AI Endpoints
 * These endpoints provide pre-configured prompts for specific use cases
 */

/** POST /ask-daily - Generate daily practice plan for a specific sign */
/** POST /ask-daily - Generate daily practice plan for a specific sign */
app.post('/ask-daily', async (req, res) => {
  const { role = 'child', focus = 'MILK' } = req.body || {};
  const prompt = `Create a short daily practice plan for ${role === 'parent' ? 'a parent teaching' : 'a child learning'} the sign "${focus}". Use 3-5 bullet points, specific, fun, and safe. Avoid medical advice.`;
  req.body = { prompt };
  return app._router.handle({ ...req, method: 'POST', url: '/ask-gpt' }, res, () => {});
});

/** POST /ask-coach - Get coaching tips for practicing a specific sign */
app.post('/ask-coach', async (req, res) => {
  const { sign = 'MILK', age = '4' } = req.body || {};
  const prompt = `Explain how to practice the sign "${sign}" with a ${age}-year-old in 3 friendly steps. Keep it simple, playful, and short. Avoid medical advice.`;
  req.body = { prompt };
  return app._router.handle({ ...req, method: 'POST', url: '/ask-gpt' }, res, () => {});
});

/** POST /ask-story - Generate bedtime story incorporating specific signs */
app.post('/ask-story', async (req, res) => {
  const { theme = 'bedtime', signs = ['MILK','STOP'] } = req.body || {};
  const useSigns = Array.isArray(signs) ? signs.join(', ') : String(signs);
  const prompt = `Write a tiny bedtime story (5-7 sentences) for a child about ${theme}. Naturally include the signs: ${useSigns}. After each word that matches a sign, include (show the sign). Keep it warm and positive.`;
  req.body = { prompt };
  return app._router.handle({ ...req, method: 'POST', url: '/ask-gpt' }, res, () => {});
});

/** POST /ask-weekly - Generate multi-day teaching plan for parents */
app.post('/ask-weekly', async (req, res) => {
  const { focus = 'MILK', days = 5 } = req.body || {};
  const prompt = `Create a ${days}-day micro-plan to teach the sign "${focus}". Each day: 2-3 bullet points, simple actions during routines (mealtime, play, dressing). Avoid medical advice.`;
  req.body = { prompt };
  return app._router.handle({ ...req, method: 'POST', url: '/ask-gpt' }, res, () => {});
});

/** POST /ask-insights - Analyze recent activity and provide parent insights */
app.post('/ask-insights', async (req, res) => {
  const { feed = [] } = req.body || {};
  const normalized = (Array.isArray(feed) ? feed : []).slice(0, 30).map(e => {
    const t = new Date(e.t || Date.now()).toISOString();
    return `${t} - ${e.type}:${e?.payload?.value ?? ''}`;
  }).join('\n');
  const prompt = `Given these recent child events with recognized signs, suggest 3 brief coaching tips for next week. Be supportive, specific, and avoid medical advice.\n\nEvents:\n${normalized}`;
  req.body = { prompt };
  return app._router.handle({ ...req, method: 'POST', url: '/ask-gpt' }, res, () => {});
});

/** POST /ask-mood - Get supportive tips based on child's current mood */
app.post('/ask-mood', async (req, res) => {
  const { mood = 'Neutral' } = req.body || {};
  const prompt = `Provide 3 short, supportive tips for a parent when a child seems ${mood}. Be practical, calming, and avoid medical advice.`;
  req.body = { prompt };
  return app._router.handle({ ...req, method: 'POST', url: '/ask-gpt' }, res, () => {});
});

/**
 * Start the server
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Sign & Speak] Server running on http://localhost:${PORT}`);
  console.log(`[Sign & Speak] Demo mode: ${DEMO_MODE ? 'ON (no API key)' : 'OFF'}`);
});