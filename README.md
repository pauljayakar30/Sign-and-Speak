# Sign & Speak

Real-time, browser-based sign recognition for kids, plus a friendly AI helper for parents.

## What’s inside
- Child’s Voice: Webcam + MediaPipe Hands to detect simple signs and speak them aloud (Text-to-Speech).
- Parent’s Learner: Ask concise parenting/how-to-teach questions powered by the OpenAI API.
- Single Node.js server serves the frontend and proxies the OpenAI request securely.

## Prerequisites
- Node.js 18+ (or 20+ recommended)
- An OpenAI API key

## Setup (local)
1. Install dependencies
```powershell
npm install
```
2. Create a `.env` file and add your OpenAI key
```powershell
Copy-Item .env.example .env
# Then edit .env and set the value
```
3. Start the server
```powershell
npm start
```
4. Open http://localhost:3000 and allow camera access.

## Try it
- Show an open palm to see and hear “STOP”.
- Make a closed fist to see and hear “MILK”.
- In Parent’s Corner, ask something like: “How can I teach the sign for ‘play’ to a 4-year-old?”

## Environment variables
Create a `.env` file based on `.env.example`:
```
OPENAI_API_KEY=sk-...
PORT=3000
```

## Replit
This repo includes a Replit config that runs the Node server and serves the site:
- Add your `OPENAI_API_KEY` as a Secret in Replit
- Click Run; Replit will expose the server URL

If you forked an older version that served static files only, make sure the run workflow is set to `npm start` and not a static server.

## Troubleshooting
- Camera doesn’t start: Ensure you’re on HTTPS (Replit) or `http://localhost` and have allowed camera permissions.
- No audio: Some browsers require a user gesture before TTS; interacting with the page (click/typing) helps.
- “Failed to get response from AI”: Verify `OPENAI_API_KEY` is set and your server logs show no errors.

## Tech notes
- Frontend: MediaPipe Hands (via CDN), Web Speech Synthesis API
- Backend: Express, CORS, OpenAI SDK
- Endpoint: `POST /ask-gpt` with JSON `{ prompt: string }`

