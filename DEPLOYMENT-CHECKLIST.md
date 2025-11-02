# 🚀 Quick Deployment Checklist

## ❌ Current Status: **NOT PRODUCTION READY**

Your app will **NOT work** when deployed to Vercel because:
- Flask ML API needs a persistent server (Vercel is serverless)
- API URL is hardcoded to localhost:5000
- TensorFlow models need to stay in memory

---

## ✅ What's Been Fixed:

- [x] Environment variable support for ML API URL
- [x] CORS configuration for production domains
- [x] Production requirements.txt created
- [x] Procfile for Railway/Render deployment
- [x] Graceful degradation (gestures work without ML)

---

## 📋 Deployment Steps

### 1️⃣ Deploy ML API First (Choose One)

#### Option A: Railway (Recommended - Free)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up

# Copy the URL (e.g., https://your-app.railway.app)
```

#### Option B: Render (Free)
1. Go to https://render.com
2. Create New → Web Service
3. Connect your GitHub repo
4. Settings:
   - Build: `pip install -r requirements.txt`
   - Start: `cd ml_training && gunicorn -w 4 -b 0.0.0.0:$PORT prediction_api:app`
   - Python Version: 3.11

### 2️⃣ Configure Frontend

```bash
cd webapp

# Create production environment file
echo "VITE_ML_API_URL=https://YOUR-ML-API-URL.railway.app/api" > .env.production

# Replace YOUR-ML-API-URL with your actual ML API domain
```

### 3️⃣ Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**IMPORTANT:** Set environment variable in Vercel Dashboard:
- Go to: Project Settings → Environment Variables
- Add: `VITE_ML_API_URL` = `https://your-ml-api.railway.app/api`
- Redeploy

### 4️⃣ Test Everything

```bash
# Test ML API
curl https://your-ml-api.railway.app/health

# Should return:
# {"status":"healthy","model":"loaded","labels":26,"features":17}
```

Then visit your Vercel URL and:
- [ ] Check console for "ML Server: Online"
- [ ] Try ISL mode - should make predictions
- [ ] Try Gestures mode - should work independently
- [ ] No CORS errors in console

---

## 🎯 Quick Test (Before Full Deployment)

To verify everything works locally first:

1. **Start ML API** (Terminal 1):
   ```bash
   cd ml_training
   python prediction_api.py
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd webapp
   npm run dev
   ```

3. **Open browser**: http://localhost:5173
   - Try switching between ISL and Gestures modes
   - Console should show mode switching logs
   - ISL should show predictions
   - Gestures should detect thumbs up, peace, etc.

---

## ⚠️ Common Issues

### "ML Server: Offline" in production
- Check Railway/Render logs for errors
- Verify environment variable is set in Vercel
- Test ML API URL directly

### CORS Errors
- Add your Vercel domain to `prediction_api.py` CORS settings
- Redeploy ML API

### Slow Predictions
- Railway free tier may be slower
- Consider upgrading for better performance
- Model takes ~2-5 seconds to load on cold start

---

## 💰 Cost

- **Frontend (Vercel)**: FREE ✅
- **ML API (Railway)**: FREE (500 hours/month) ✅
- **Total**: $0/month for development

For production with high traffic, upgrade Railway to hobby plan ($5/month).

---

## 📚 Full Documentation

See `docs/PRODUCTION-DEPLOYMENT.md` for:
- Detailed architecture
- Alternative deployment options
- Troubleshooting guide
- Monitoring setup
- Performance optimization

---

## 🆘 Need Help?

If deployment fails:
1. Check Railway/Render logs
2. Test ML API health endpoint
3. Verify environment variables
4. Check browser console for errors
5. Review CORS settings

The app will work in "gestures-only" mode even if ML API fails!
