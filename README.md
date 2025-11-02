# 🦦 Sign & Speak

> **Turn Gestures Into Words** – Real-time, browser-based sign recognition for kids, plus a friendly AI helper for parents.

![Sign & Speak](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)

---

## ✨ Features

### 🎯 **Real-Time Sign Recognition**
- Detects **15+ hand signs** instantly using your device camera
- Recognizes **7 facial expressions** for mood tracking
- Powered by **MediaPipe** computer vision – all processing stays on your device

### 👶 **Child-Friendly Learning**
- **Gamified rewards** system with stars and unlockable stickers
- **Character selection** (Otter, Panda, Fox, Dino)
- **Training mode** with guided practice and hints
- **Daily goals** with visual progress rings
- Kid-friendly fonts (Fredoka, Baloo 2) for readability

### 📊 **Parent Dashboard**
- **Real-time activity feed** showing signs recognized and mood changes
- **Analytics & KPIs**: total stars, unique signs, practice time, current mood
- **Trend visualizations** with sparkline charts
- **Secure pairing** via unique 6-digit codes (no accounts needed)

### 🤖 **AI-Powered Coach**
- Personalized tips and encouragement powered by **OpenAI GPT-4o-mini**
- Specialized endpoints for:
  - Daily practice ideas
  - Weekly progress summaries
  - Next steps recommendations
  - Mood-based responses
  - Custom coaching questions
- **Demo mode** with simulated responses when API key is unavailable

### 🔒 **Privacy First**
- **All camera processing happens locally** in your browser
- Video data **never leaves your device**
- No account registration required
- Minimal data collection (only session-based pairing)

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ (or 20+ recommended)
- An OpenAI API key (optional – works in demo mode without it)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/pauljayakar30/Sign-and-Speak.git
   cd Sign-and-Speak
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
   ```bash
   # Copy example file
   Copy-Item .env.example .env
   
   # Edit .env and add your OpenAI API key (or leave blank for demo mode)
   ```

4. **Start development servers**

   **Option A: Start both servers (recommended)**
   ```bash
   # Terminal 1 - Backend (port 3000)
   npm start

   # Terminal 2 - Frontend (port 5173)
   npm run dev:webapp
   ```

   **Option B: Use VS Code tasks**
   - Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - Select "Tasks: Run Task"
   - Choose "Start server" or "Start React dev server"

5. **Open in browser**
   ```
   http://localhost:5173
   ```

6. **Try it out**
   - Allow camera access when prompted
   - Show an open palm to see and hear "STOP"
   - Make a closed fist to see and hear "MILK"
   - In Parent's Corner, ask: "How can I teach the sign for 'play' to a 4-year-old?"

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** – Component-based UI
- **Vite 5.4** – Lightning-fast build tool and dev server
- **Framer Motion** – Smooth page transitions and animations
- **MediaPipe (Google)** – Hand gesture and facial expression detection
- **CSS Custom Properties** – Design system with fluid typography and 8pt grid

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

## 📁 Project Structure

```
Sign-and-Speak/
├── docs/                     # Documentation
│   ├── README.md             # Documentation index
│   ├── DEPLOYMENT.md         # Deployment guide
│   ├── PRE-COMMIT-CHECKLIST.md
│   └── fixes/                # Implementation fix documentation
├── design/                   # Design system documentation
├── webapp/                   # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React Context providers
│   │   ├── App.jsx           # Main React component
│   │   └── styles.css        # Global styles
│   ├── package.json
│   └── vite.config.js
├── legacy/                   # Legacy HTML/JS/CSS (deprecated)
├── server.js                 # Express backend
├── package.json              # Root dependencies
├── vercel.json               # Vercel deployment config
└── README.md                 # This file
```

---

## 📚 Documentation

- **[docs/README.md](docs/README.md)** - Complete documentation index
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Step-by-step deployment guide
- **[design/](design/)** - Full design system documentation
- **[docs/fixes/](docs/fixes/)** - Technical implementation improvements

---

## 🌐 Deployment

### **Deploy to Vercel** (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configure environment variables**
   - In Vercel dashboard: Settings → Environment Variables
   - Add `OPENAI_API_KEY` with your API key (or leave blank for demo mode)

3. **Deploy**
   ```bash
   npm run deploy
   ```

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for detailed deployment instructions.

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
👋 Wave • ✋ Stop • 👍 Good • 👎 No • 👌 OK • ☮️ Peace • 👏 Clap • 🙏 Thank You • ...and more

### **Facial Expressions** (7)
😊 Happy • 😢 Sad • 😮 Surprised • 😠 Angry • 😐 Neutral • 😨 Fearful • 🤢 Disgusted

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Before committing**, review the **[docs/PRE-COMMIT-CHECKLIST.md](docs/PRE-COMMIT-CHECKLIST.md)**

---

## 🐛 Troubleshooting

- **Camera doesn't start**: Ensure you're on HTTPS or `http://localhost` and have allowed camera permissions
- **No audio**: Some browsers require a user gesture before text-to-speech works
- **"Failed to get response from AI"**: Verify `OPENAI_API_KEY` is set in `.env` file
- **Build errors**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

---

## 📝 License

This project is licensed under the **MIT License** – see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **MediaPipe** (Google) – Hand tracking and facial recognition
- **OpenAI** – GPT-4o-mini API for AI coaching
- **Framer Motion** – Animation library
- **Vercel** – Hosting platform

---

## 📬 Contact

**Project Maintainer**: Paul J.

- GitHub: [@pauljayakar30](https://github.com/pauljayakar30)
- Repository: [Sign-and-Speak](https://github.com/pauljayakar30/Sign-and-Speak)

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
