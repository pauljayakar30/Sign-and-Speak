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
// Gracefully handle invalid JSON bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).send({ error: 'Invalid JSON body' });
  }
  next();
});
app.use(cors()); // Allow requests from your frontend

// Serve the static frontend from the same server for simplicity
app.use(express.static(__dirname));

// Redact helper for logs: masks tokens like sk-... and sk-proj-... to avoid accidental exposure
function redact(s) {
  try {
    const str = String(s ?? '');
    // Mask OpenAI-style keys (sk- or sk-proj- prefixes)
    return str
      .replace(/sk-[a-zA-Z0-9_-]{10,}/g, (m) => m.slice(0, 6) + '***REDACTED***')
      .replace(/sk-proj-[a-zA-Z0-9_-]{10,}/g, (m) => m.slice(0, 9) + '***REDACTED***');
  } catch { return '[redacted]'; }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEMO_MODE = process.env.DEMO_MODE === '1' || !process.env.OPENAI_API_KEY;
if (!process.env.OPENAI_API_KEY) {
  console.warn('[Sign & Speak] Warning: OPENAI_API_KEY is not set. AI endpoints will run in DEMO MODE.');
}

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const MAX_TOKENS = Number(process.env.OPENAI_MAX_TOKENS || 150);
const DEMO_FALLBACK_ON_QUOTA = process.env.DEMO_FALLBACK_ON_QUOTA === '1';

// Health check
app.get('/health', (_req, res) => res.send({ ok: true }));

// Align the route with the frontend
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

// Explicit root to index.html (useful if static middleware pathing changes)
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Minimal diagnostics endpoint (no secrets)
app.get('/env-ok', (_req, res) => {
  res.send({ openaiKeyPresent: Boolean(process.env.OPENAI_API_KEY), demoMode: DEMO_MODE });
});

// --- Simple in-memory pairing store (for demo) ---
const pairs = new Map(); // code -> { claimed: bool, childId: string|null, parentId: string|null, feed: [] }
function randomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate a pairing code (parent)
app.post('/pair/generate', (_req, res) => {
  let code = randomCode();
  while (pairs.has(code)) code = randomCode();
  pairs.set(code, { claimed: false, childId: null, parentId: null, feed: [] });
  res.send({ code });
});

// Claim a code (child)
app.post('/pair/claim', (req, res) => {
  const { code } = req.body || {};
  if (!code || !pairs.has(code)) return res.status(400).send({ error: 'Invalid code' });
  const p = pairs.get(code);
  if (p.claimed) return res.status(409).send({ error: 'Already claimed' });
  p.claimed = true;
  res.send({ ok: true });
});

// Poll status (parent)
app.get('/pair/status/:code', (req, res) => {
  const code = req.params.code;
  const p = pairs.get(code);
  if (!p) return res.status(404).send({ error: 'Not found' });
  res.send({ claimed: p.claimed });
});

// Child event -> feed (e.g., recognized sign)
app.post('/pair/event', (req, res) => {
  const { code, type } = req.body || {};
  const payload = req.body?.payload ?? (req.body?.value !== undefined ? { value: req.body.value } : undefined);
  if (!code || !pairs.has(code)) return res.status(400).send({ error: 'Invalid code' });
  const p = pairs.get(code);
  const entry = { t: Date.now(), type, payload };
  p.feed.unshift(entry);
  p.feed = p.feed.slice(0, 50);
  res.send({ ok: true });
});

// Parent fetch feed
app.get('/pair/feed/:code', (req, res) => {
  const code = req.params.code;
  const p = pairs.get(code);
  if (!p) return res.status(404).send({ error: 'Not found' });
  res.send({ feed: p.feed });
});

// Daily plan via AI (simple wrapper)
app.post('/ask-daily', async (req, res) => {
  const { role = 'child', focus = 'MILK' } = req.body || {};
  const prompt = `Create a short daily practice plan for ${role === 'parent' ? 'a parent teaching' : 'a child learning'} the sign "${focus}". Use 3-5 bullet points, specific, fun, and safe. Avoid medical advice.`;
  req.body = { prompt };
  return app._router.handle({ ...req, method: 'POST', url: '/ask-gpt' }, res, () => {});
});

// Coaching tips for a sign (child-friendly wording)
app.post('/ask-coach', async (req, res) => {
  const { sign = 'MILK', age = '4' } = req.body || {};
  const prompt = `Explain how to practice the sign "${sign}" with a ${age}-year-old in 3 friendly steps. Keep it simple, playful, and short. Avoid medical advice.`;
  req.body = { prompt };
  return app._router.handle({ ...req, method: 'POST', url: '/ask-gpt' }, res, () => {});
});

// Bedtime story with signs incorporated
app.post('/ask-story', async (req, res) => {
  const { theme = 'bedtime', signs = ['MILK','STOP'] } = req.body || {};
  const useSigns = Array.isArray(signs) ? signs.join(', ') : String(signs);
  const prompt = `Write a tiny bedtime story (5-7 sentences) for a child about ${theme}. Naturally include the signs: ${useSigns}. After each word that matches a sign, include (show the sign). Keep it warm and positive.`;
  req.body = { prompt };
  return app._router.handle({ ...req, method: 'POST', url: '/ask-gpt' }, res, () => {});
});

// Weekly plan (parent-focused)
app.post('/ask-weekly', async (req, res) => {
  const { focus = 'MILK', days = 5 } = req.body || {};
  const prompt = `Create a ${days}-day micro-plan to teach the sign "${focus}". Each day: 2-3 bullet points, simple actions during routines (mealtime, play, dressing). Avoid medical advice.`;
  req.body = { prompt };
  return app._router.handle({ ...req, method: 'POST', url: '/ask-gpt' }, res, () => {});
});

// Insights for parents from recent feed
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

// Mood advice from a simple label
app.post('/ask-mood', async (req, res) => {
  const { mood = 'Neutral' } = req.body || {};
  const prompt = `Provide 3 short, supportive tips for a parent when a child seems ${mood}. Be practical, calming, and avoid medical advice.`;
  req.body = { prompt };
  return app._router.handle({ ...req, method: 'POST', url: '/ask-gpt' }, res, () => {});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});