# 📚 Documentation Index

This folder contains all documentation for the Sign & Speak project.

## 📋 Main Documentation

- **[../README.md](../README.md)** - Project overview, features, and setup instructions
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide for Vercel
- **[PRE-COMMIT-CHECKLIST.md](PRE-COMMIT-CHECKLIST.md)** - Quality assurance checklist
- **[REPOSITORY-ORGANIZATION.md](REPOSITORY-ORGANIZATION.md)** - How the repository is organized

## 🎨 Design System

The [`design/`](../design/) folder contains comprehensive design documentation:

- **[Overview.md](../design/Overview.md)** - Design system overview
- **[Brand.md](../design/Brand.md)** - Brand guidelines and identity
- **[StyleGuide.md](../design/StyleGuide.md)** - Visual style guide
- **[Typography-System.md](../design/Typography-System.md)** - Typography specifications
- **[Spacing-System.md](../design/Spacing-System.md)** - 8pt grid spacing system
- **[Components.md](../design/Components.md)** - Component library
- **[Component-Architecture.md](../design/Component-Architecture.md)** - React architecture
- **[Accessibility.md](../design/Accessibility.md)** - WCAG AAA guidelines
- **[Modern-UX-Patterns.md](../design/Modern-UX-Patterns.md)** - UX best practices
- **[ReactHandoff.md](../design/ReactHandoff.md)** - Developer handoff guide

## 🔧 Implementation Fixes

The [`fixes/`](fixes/) folder documents major improvements made to the codebase:

### UX Improvements
- **[CALIBRATION-UX-FIX.md](fixes/CALIBRATION-UX-FIX.md)** - Professional calibration experience with loading states
- **[MOBILE-UX-FIX.md](fixes/MOBILE-UX-FIX.md)** - Mobile-first optimization (camera viewport +87.5%, swipe gestures)
- **[MOBILE-OPTIMIZATIONS.md](fixes/MOBILE-OPTIMIZATIONS.md)** - Comprehensive mobile improvements
- **[VISUAL-FEEDBACK-FIX.md](fixes/VISUAL-FEEDBACK-FIX.md)** - Real-time visual feedback during practice

### Technical Improvements
- **[CAMERA-PANEL-FIX.md](fixes/CAMERA-PANEL-FIX.md)** - Props-based camera integration
- **[CAMERA-LAYOUT-FIX.md](fixes/CAMERA-LAYOUT-FIX.md)** - Professional camera layout with aspect ratio constraints
- **[ERROR-HANDLING-FIX.md](fixes/ERROR-HANDLING-FIX.md)** - Comprehensive error handling system
- **[PRIMITIVE-EVENT-FIX.md](fixes/PRIMITIVE-EVENT-FIX.md)** - Window events replaced with React Context API
- **[PROGRESS-TRACKING-FIX.md](fixes/PROGRESS-TRACKING-FIX.md)** - Comprehensive learning analytics system
- **[SIDEBAR-IMPLEMENTATION.md](fixes/SIDEBAR-IMPLEMENTATION.md)** - Left sidebar navigation

## 🗂️ Folder Structure

```
SignSync/
├── docs/                    # All documentation (you are here)
│   ├── README.md            # This file
│   ├── DEPLOYMENT.md        # Deployment guide
│   ├── PRE-COMMIT-CHECKLIST.md
│   └── fixes/               # Implementation fix documentation
├── design/                  # Design system documentation
├── webapp/                  # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React Context providers
│   │   └── ...
│   └── package.json
├── legacy/                  # Legacy HTML/JS/CSS files (deprecated)
├── server.js                # Express backend server
├── package.json             # Root package.json
└── README.md                # Main project README
```

## 🚀 Quick Start

1. **New to the project?** Start with [../README.md](../README.md)
2. **Deploying?** Read [DEPLOYMENT.md](DEPLOYMENT.md)
3. **Contributing?** Check [PRE-COMMIT-CHECKLIST.md](PRE-COMMIT-CHECKLIST.md)
4. **Understanding the design?** Explore [../design/](../design/)
5. **Learning about fixes?** Browse [fixes/](fixes/)

## 📖 External Resources

- [MediaPipe Hands Documentation](https://google.github.io/mediapipe/solutions/hands.html)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Express.js Guide](https://expressjs.com/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
