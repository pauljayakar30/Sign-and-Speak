# 🚀 Production Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  Frontend (React + Vite)                │
│  Deployed on: Vercel                    │
│  URL: your-app.vercel.app               │
└──────────────┬──────────────────────────┘
               │ HTTPS API Calls
               ↓
┌─────────────────────────────────────────┐
│  ML API (Flask + TensorFlow)            │
│  Deployed on: Railway/Render/Heroku     │
│  URL: your-ml-api.railway.app           │
└─────────────────────────────────────────┘
```

## ⚠️ Current Issues

### ❌ Will NOT Work Out of the Box Because:

1. **Flask API needs separate hosting** - Vercel doesn't support long-running Python servers
2. **localhost:5000 hardcoded** - Won't work in production
3. **Large TensorFlow models** - Need persistent server with enough memory
4. **Cold start issues** - Serverless functions timeout loading ML models

## ✅ Deployment Solutions

---

## Option A: Split Deployment (RECOMMENDED)

### Step 1: Deploy ML API to Railway/Render

#### **Using Railway (Free Tier):**

1. **Create Railway Account**: https://railway.app
2. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   railway login
   ```

3. **Deploy ML API**:
   ```bash
   cd SignSync
   railway init
   railway up
   ```

4. **Set Environment Variables** in Railway Dashboard:
   - `PORT` = 5000
   - `FLASK_ENV` = production

5. **Get Your API URL**: 
   - Copy from Railway dashboard (e.g., `https://your-app.railway.app`)

#### **Using Render (Free Tier):**

1. **Create Render Account**: https://render.com
2. **Create New Web Service**
3. **Connect GitHub Repo**
4. **Configure**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `cd ml_training && gunicorn -w 4 -b 0.0.0.0:$PORT prediction_api:app`
   - Python Version: 3.11

### Step 2: Deploy Frontend to Vercel

1. **Update Environment Variable**:
   ```bash
   cd webapp
   echo "VITE_ML_API_URL=https://your-ml-api.railway.app/api" > .env.production
   ```

2. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Set Environment Variable in Vercel Dashboard**:
   - Go to: Project Settings → Environment Variables
   - Add: `VITE_ML_API_URL` = `https://your-ml-api.railway.app/api`
   - Redeploy

---

## Option B: All-in-One on Railway/Render

Deploy both frontend and backend together:

### Railway Deployment:

```bash
# Create railway.json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "cd webapp && npm install && npm run build && cd .. && pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "cd ml_training && gunicorn prediction_api:app & cd webapp && npm run preview",
    "healthcheckPath": "/health"
  }
}
```

---

## Option C: Disable ML Features for Vercel-Only Deployment

If you want to deploy on Vercel only (without ML API):

1. **Make ML features optional**:
   ```javascript
   // In webapp/src/components/RecognitionModeSelector.jsx
   // Hide ISL mode if ML API is not available
   ```

2. **Default to gestures-only mode**:
   ```javascript
   const [recognitionMode, setRecognitionMode] = useState('gestures')
   ```

3. **Deploy to Vercel** (ML features will show "ML Offline")

---

## 📋 Pre-Deployment Checklist

### ML API (Flask):
- [ ] Update CORS to allow your production domain
- [ ] Add production domain to `CORS(app, origins=['https://your-app.vercel.app'])`
- [ ] Test model loading time (should be < 30 seconds)
- [ ] Verify model files exist in `ml_training/models/`
- [ ] Add health check endpoint (already exists at `/health`)

### Frontend (React):
- [ ] Update `islApi.js` to use environment variable
- [ ] Create `.env.production` with ML API URL
- [ ] Test build: `npm run build`
- [ ] Verify dist folder is created
- [ ] Test production build: `npm run preview`

### Both:
- [ ] Update `requirements.txt` with all Python dependencies
- [ ] Add `gunicorn` to requirements.txt
- [ ] Test CORS with production domains
- [ ] Monitor API response times
- [ ] Set up error logging (Sentry, LogRocket, etc.)

---

## 🔧 Required Code Changes

### 1. Update CORS in Flask API:

```python
# ml_training/prediction_api.py
from flask_cors import CORS

app = Flask(__name__)

# Allow your production domains
CORS(app, origins=[
    'http://localhost:5173',  # Dev
    'https://your-app.vercel.app',  # Production
    'https://*.vercel.app'  # All Vercel deployments
])
```

### 2. Environment-Aware API URL (DONE ✅):

```javascript
// webapp/src/services/islApi.js
const API_BASE_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000/api'
```

### 3. Add Graceful Degradation:

```javascript
// Show user-friendly message when ML API is offline
if (!mlApiStatus?.online) {
  return (
    <div className="ml-offline-notice">
      🔌 ML features are currently offline. 
      Only gesture recognition is available.
    </div>
  )
}
```

---

## 💰 Cost Comparison

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| **Vercel** (Frontend) | ✅ Unlimited | Static sites, React apps |
| **Railway** (ML API) | 500 hours/month | Python backends, persistent servers |
| **Render** (ML API) | 750 hours/month | Web services, free SSL |
| **Heroku** (ML API) | ❌ No free tier | Not recommended |
| **PythonAnywhere** | 1 web app | Simple Flask apps |

---

## 🧪 Testing Your Deployment

### 1. Test ML API:
```bash
curl https://your-ml-api.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "model": "loaded",
  "labels": 26,
  "features": 17
}
```

### 2. Test Prediction:
```bash
curl -X POST https://your-ml-api.railway.app/api/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7]}'
```

### 3. Test Frontend:
- Visit your Vercel URL
- Open browser console (F12)
- Check for ML API connection logs
- Try switching modes
- Verify ISL/Gestures work correctly

---

## 🐛 Troubleshooting

### Issue: "ML API Offline"
- Check Railway/Render logs
- Verify environment variables
- Check CORS configuration
- Test API endpoint directly

### Issue: "Module not found: tensorflow"
- Add tensorflow to `requirements.txt`
- Rebuild on Railway/Render
- Check build logs

### Issue: "Cold start timeout"
- Increase timeout in Railway settings
- Use smaller TensorFlow model
- Consider model caching strategies

### Issue: CORS errors
- Update Flask CORS origins
- Add production domain
- Check browser console for specific error

---

## 📊 Monitoring

### Add Health Checks:
- Railway: Automatic health checks at `/health`
- Uptime monitoring: UptimeRobot (free)
- Error tracking: Sentry (free tier)

### Performance Monitoring:
- ML API response time: Should be < 500ms
- Model loading time: Track on startup
- Prediction accuracy: Log confidence scores

---

## 🎯 Quick Start (Railway)

```bash
# 1. Deploy ML API
cd SignSync
railway login
railway init
railway up

# 2. Get API URL from Railway dashboard
ML_API_URL="https://your-app.railway.app"

# 3. Update frontend env
cd webapp
echo "VITE_ML_API_URL=$ML_API_URL/api" > .env.production

# 4. Deploy frontend
vercel --prod

# 5. Set env var in Vercel dashboard
# VITE_ML_API_URL = https://your-app.railway.app/api

# 6. Test
curl $ML_API_URL/health
```

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Frontend loads on Vercel
- ✅ ML API responds to health check
- ✅ Mode selector shows "ML Server: Online"
- ✅ ISL mode makes predictions
- ✅ Gestures mode works independently
- ✅ No CORS errors in console
- ✅ Predictions appear within 500ms

---

## 📝 Summary

**For Production:**
1. Deploy ML API to Railway/Render (persistent Python server)
2. Deploy Frontend to Vercel (static React app)
3. Connect them via environment variables
4. Update CORS settings
5. Test thoroughly

**Quick Answer:** No, won't work as-is. Need to split deployment: Frontend on Vercel + ML API on Railway/Render.
