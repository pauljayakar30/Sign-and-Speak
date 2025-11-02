/**
 * Vercel Serverless Function - Environment Status
 * Returns whether OpenAI API key is configured and demo mode status
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const openaiKeyPresent = Boolean(process.env.OPENAI_API_KEY);
  const demoMode = !openaiKeyPresent;

  return res.json({
    openaiKeyPresent,
    demoMode
  });
}
