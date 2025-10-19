# 🦦 Sign & Speak# Sign & Speak



> **Turn Gestures Into Words** – An interactive platform that recognizes hand signs and facial expressions in real-time, helping children communicate and learn with joy.Real-time, browser-based sign recognition for kids, plus a friendly AI helper for parents.



![Sign & Speak](https://img.shields.io/badge/Status-Production%20Ready-success)## What’s inside

![License](https://img.shields.io/badge/License-MIT-blue)- Child’s Voice: Webcam + MediaPipe Hands to detect simple signs and speak them aloud (Text-to-Speech).

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)- Parent’s Learner: Ask concise parenting/how-to-teach questions powered by the OpenAI API.

![Node](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)- Single Node.js server serves the frontend and proxies the OpenAI request securely.



---## Prerequisites

- Node.js 18+ (or 20+ recommended)

## ✨ Features- An OpenAI API key



### 🎯 **Real-Time Sign Recognition**## Setup (local)

- Detects **15+ hand signs** instantly using your device camera1. Install dependencies

- Recognizes **7 facial expressions** for mood tracking```powershell

- Powered by **MediaPipe** computer vision – all processing stays on your devicenpm install

```

### 👶 **Child-Friendly Learning**2. Create a `.env` file and add your OpenAI key

- **Gamified rewards** system with stars and unlockable stickers```powershell

- **Character selection** (Otter, Panda, Fox, Dino)Copy-Item .env.example .env

- **Training mode** with guided practice and hints# Then edit .env and set the value

- **Daily goals** with visual progress rings```

- Kid-friendly fonts (Fredoka, Baloo 2) for readability3. Start the server

```powershell

### 📊 **Parent Dashboard**npm start

- **Real-time activity feed** showing signs recognized and mood changes```

- **Analytics & KPIs**: total stars, unique signs, practice time, current mood4. Open http://localhost:3000 and allow camera access.

- **Trend visualizations** with sparkline charts

- **Secure pairing** via unique 6-digit codes (no accounts needed)## Try it

- Show an open palm to see and hear “STOP”.

### 🤖 **AI-Powered Coach**- Make a closed fist to see and hear “MILK”.

- Personalized tips and encouragement powered by **OpenAI GPT-4o-mini**- In Parent’s Corner, ask something like: “How can I teach the sign for ‘play’ to a 4-year-old?”

- Specialized endpoints for:

  - Daily practice ideas## Environment variables

  - Weekly progress summariesCreate a `.env` file based on `.env.example`:

  - Next steps recommendations```

  - Mood-based responsesOPENAI_API_KEY=sk-...

  - Custom coaching questionsPORT=3000

- **Demo mode** with simulated responses when API key is unavailable```



### 🔒 **Privacy First**## Replit

- **All camera processing happens locally** in your browserThis repo includes a Replit config that runs the Node server and serves the site:

- Video data **never leaves your device**- Add your `OPENAI_API_KEY` as a Secret in Replit

- No account registration required- Click Run; Replit will expose the server URL

- Minimal data collection (only session-based pairing)

If you forked an older version that served static files only, make sure the run workflow is set to `npm start` and not a static server.

---

## Troubleshooting

## 🛠️ Tech Stack- Camera doesn’t start: Ensure you’re on HTTPS (Replit) or `http://localhost` and have allowed camera permissions.

- No audio: Some browsers require a user gesture before TTS; interacting with the page (click/typing) helps.

### **Frontend**- “Failed to get response from AI”: Verify `OPENAI_API_KEY` is set and your server logs show no errors.

- **React 18** – Component-based UI

- **Vite 5.4** – Lightning-fast build tool and dev server## Tech notes

- **Framer Motion** – Smooth page transitions and animations- Frontend: MediaPipe Hands (via CDN), Web Speech Synthesis API

- **MediaPipe (Google)** – Hand gesture and facial expression detection- Backend: Express, CORS, OpenAI SDK

- **CSS Custom Properties** – Design system with fluid typography and 8pt grid- Endpoint: `POST /ask-gpt` with JSON `{ prompt: string }`



### **Backend**
- **Node.js + Express** – REST API server
- **OpenAI API** – GPT-4o-mini for AI coaching
- **In-memory pairing** – Session-based child-parent connection (no database)

### **Design System**
- **Typography**: Fluid responsive scale using `clamp()` (40-64px → 12-13px)
- **Spacing**: Systematic 8pt grid (`--space-1` to `--space-24`)
- **Colors**: Modern palette with gradients and semantic naming
- **Fonts**: 
  - Poppins (Parent dashboard, professional)
  - Fredoka + Baloo 2 (Child interface, playful)
  - Inter (Default, clean and legible)

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ and npm
- OpenAI API key (optional, works in demo mode without it)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/sign-and-speak.git
   cd sign-and-speak
   ```

2. **Install dependencies**
   ```bash
   # Root (backend)
   npm install

   # Frontend (React app)
   cd webapp
   npm install
   cd ..
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the project root:
   ```env
   OPENAI_API_KEY=your_api_key_here
   # Optional: Leave blank to use demo mode with simulated responses
   ```

4. **Start development servers**

   **Terminal 1 (Backend)**:
   ```bash
   npm start
   # Server runs on http://localhost:3000
   ```

   **Terminal 2 (Frontend)**:
   ```bash
   cd webapp
   npm run dev
   # Dev server runs on http://localhost:5173
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 📁 Project Structure

```
sign-and-speak/
├── server.js                 # Express API server
├── package.json              # Backend dependencies
├── .env                      # Environment variables (not committed)
├── design/                   # Design documentation and assets
│   ├── assets/               # Logos and SVG files
│   ├── Typography-System.md  # Type scale documentation
│   └── Spacing-System.md     # 8pt grid guide
└── webapp/                   # React frontend
    ├── src/
    │   ├── App.jsx           # Main React component with routing
    │   ├── main.jsx          # React entry point
    │   ├── styles.css        # Global styles + design system
    │   └── components/
    │       ├── ChildHome.jsx       # Child learning interface
    │       ├── ParentDashboard.jsx # Parent analytics view
    │       ├── NewHome.jsx         # Landing page
    │       ├── TrainingMode.jsx    # Guided practice mode
    │       ├── CameraPanel.jsx     # MediaPipe integration
    │       ├── CoachWidget.jsx     # AI coach floating widget
    │       ├── GoalRing.jsx        # Progress visualization
    │       ├── StickerBook.jsx     # Reward system
    │       └── CharacterPicker.jsx # Avatar selection
    ├── index.html            # HTML entry point
    ├── vite.config.js        # Vite build configuration
    └── package.json          # Frontend dependencies
```

---

## 🎨 Design System

### **Typography Scale**
Fluid responsive typography using CSS `clamp()`:
- **Display**: `clamp(2.5rem, 5vw + 1rem, 4rem)` (40-64px)
- **H1**: `clamp(2rem, 3vw + 1rem, 3rem)` (32-48px)
- **H2**: `clamp(1.5rem, 2vw + 0.5rem, 2.25rem)` (24-36px)
- **Body**: `clamp(0.9375rem, 0.5vw + 0.75rem, 1rem)` (15-16px)

### **Spacing System**
8pt grid with 13 systematic values:
- `--space-1`: 4px (micro)
- `--space-4`: 16px (base)
- `--space-8`: 32px (large)
- `--space-24`: 96px (hero)

See [design/Typography-System.md](design/Typography-System.md) and [design/Spacing-System.md](design/Spacing-System.md) for full documentation.

---

## 🌐 Deployment

### **Deploy to Vercel** (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configure environment variables**
   
   In Vercel dashboard:
   - Go to **Settings** → **Environment Variables**
   - Add `OPENAI_API_KEY` with your API key
   - Or leave blank for demo mode

3. **Deploy**
   ```bash
   vercel
   ```

4. **Production URL**
   ```
   https://sign-and-speak.vercel.app
   ```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide.

---

## 🔑 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ask-gpt` | POST | Custom GPT prompts |
| `/ask-daily` | POST | Daily practice ideas |
| `/ask-coach` | POST | Coaching encouragement |
| `/ask-story` | POST | Story generation |
| `/ask-weekly` | POST | Weekly summary |
| `/ask-insights` | POST | Next steps recommendations |
| `/ask-mood` | POST | Mood-based responses |
| `/pair/generate` | POST | Generate pairing code |
| `/pair/claim` | POST | Claim pairing code |
| `/pair/status/:code` | GET | Check pairing status |
| `/pair/event/:code` | POST | Post child activity event |
| `/pair/feed/:code` | GET | Get activity feed |
| `/env-ok` | GET | Check environment/demo mode |

---

## 📊 Sign Recognition

### **Hand Signs Detected** (15+)
- 👋 Wave
- ✋ Stop  
- 👍 Good
- 👎 No
- 👌 OK
- ☮️ Peace
- 👏 Clap
- 🙏 Thank You
- ...and more

### **Facial Expressions** (7)
- 😊 Happy
- 😢 Sad
- 😮 Surprised
- 😠 Angry
- 😐 Neutral
- 😨 Fearful
- 🤢 Disgusted

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Code Style**:
- Use ESLint rules (configured in project)
- Follow existing naming conventions
- Add JSDoc comments for all functions
- Update documentation for new features

---

## 📝 License

This project is licensed under the **MIT License** – see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **MediaPipe** (Google) – Hand tracking and facial recognition
- **OpenAI** – GPT-4o-mini API for AI coaching
- **Framer Motion** – Animation library
- **Vercel** – Hosting platform
- All open-source contributors and libraries

---

## 📬 Contact

**Project Maintainer**: Paul J.

- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- Project Link: [https://github.com/YOUR_USERNAME/sign-and-speak](https://github.com/YOUR_USERNAME/sign-and-speak)

---

## 🎯 Roadmap

- [ ] Add more sign language vocabularies (ASL, BSL)
- [ ] Persistent user progress with optional accounts
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Custom sign training mode
- [ ] Export progress reports (PDF)
- [ ] Accessibility enhancements (screen reader support)

---

<div align="center">
  <strong>Built with ❤️ for inclusive communication</strong>
  <br>
  <sub>Camera data stays in your browser. Privacy first, always.</sub>
</div>
