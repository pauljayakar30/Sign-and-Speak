/**
 * Vercel Serverless Function - OpenAI GPT API
 * Handles AI coaching requests with demo mode fallback
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Demo mode: Enable if no API key is provided
const DEMO_MODE = !process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const MAX_TOKENS = Number(process.env.OPENAI_MAX_TOKENS || 150);

// Demo response generator
function demoReply(prompt) {
  const p = (prompt || '').toLowerCase();
  if (p.includes('milk')) return 'Practice the MILK sign by making a gentle fist and squeezing like milking a cow. Do it 3 times daily at snack time!';
  if (p.includes('stop')) return 'For STOP, hold your palm up like a traffic officer. Practice when saying "stop" during play. Make it fun!';
  if (p.includes('more')) return 'MORE is easy! Tap fingertips together. Use it at meal times when they want more food. Repeat often!';
  if (p.includes('help')) return 'HELP: Put fist on open palm and lift up. Practice when they need assistance. Celebrate when they use it!';
  if (p.includes('story')) return 'Once upon a time, there was a little otter who loved MILK. Every morning, the otter would make the MILK sign and swim to get fresh milk from the sea caves. The end! 🦦🥛';
  return 'Here's a quick tip: Pair the sign with the word and action. Say it, show it, and repeat in short bursts. Keep it fun!';
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Demo mode
  if (DEMO_MODE) {
    return res.json({ response: demoReply(prompt), demo: true });
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      max_tokens: MAX_TOKENS,
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful, supportive assistant for parents teaching basic signs to kids. Be concise, positive, and actionable. Avoid medical advice.' 
        },
        { role: 'user', content: prompt }
      ],
    });

    const content = response.choices?.[0]?.message?.content ?? 'No response';
    return res.json({ response: content, demo: false });

  } catch (error) {
    console.error('OpenAI API error:', error.message);
    
    // Fallback to demo on error
    return res.json({ response: demoReply(prompt), demo: true });
  }
}
