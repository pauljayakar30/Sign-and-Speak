# 🚨 DEPLOYMENT NOTICE

## Will This Work When Deployed? **NO** ❌

### Current Setup:
- **Frontend**: React app (can deploy to Vercel ✅)
- **ML API**: Flask + TensorFlow (needs Railway/Render ❌)

### The Problem:
Your Flask ML API (`ml_training/prediction_api.py`) needs a **persistent Python server** to:
- Keep TensorFlow model loaded in memory (200MB+)
- Handle real-time predictions quickly
- Stay running 24/7

**Vercel serverless functions can't do this** - they timeout after 10-60 seconds and have cold starts.

---

## ✅ Solution: Split Deployment

1. **Deploy ML API** → Railway or Render (free tier available)
2. **Deploy Frontend** → Vercel (free)
3. **Connect them** → Environment variables

**Time needed**: 15-20 minutes

---

## 📋 Quick Start

See these files for step-by-step instructions:

1. **`DEPLOYMENT-CHECKLIST.md`** - Quick checklist (5 min read)
2. **`docs/PRODUCTION-DEPLOYMENT.md`** - Full guide (all options)

---

## 🎯 TL;DR

```bash
# 1. Deploy ML API to Railway
railway login && railway up

# 2. Get URL from Railway dashboard
# Example: https://signsync-ml.railway.app

# 3. Set env var and deploy frontend
cd webapp
echo "VITE_ML_API_URL=https://signsync-ml.railway.app/api" > .env.production
vercel --prod

# 4. Done! 🎉
```

---

## 💡 Alternative: Deploy Without ML

If you want Vercel-only deployment:
- Only "Daily Gestures" mode will work
- ISL mode will show "ML Offline"
- No code changes needed - it gracefully degrades

```bash
cd webapp
vercel --prod
# ML features will be disabled automatically
```

---

## ✅ Changes Already Made for Production:

- [x] Environment variable support (`VITE_ML_API_URL`)
- [x] CORS configuration for production
- [x] Graceful degradation (gestures work without ML)
- [x] Production requirements.txt
- [x] Deployment configs (Procfile, runtime.txt)

**All ready to deploy! Just follow the checklist.**
