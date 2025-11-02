# 🚀 Deployment Guide - Sign & Speak

Complete step-by-step guide for deploying **Sign & Speak** to production using Vercel.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Prepare for Deployment](#prepare-for-deployment)
3. [Deploy to Vercel](#deploy-to-vercel)
4. [Environment Variables](#environment-variables)
5. [Custom Domain (Optional)](#custom-domain-optional)
6. [Troubleshooting](#troubleshooting)
7. [Alternative Platforms](#alternative-platforms)

---

## ✅ Prerequisites

Before deploying, ensure you have:

- ✅ **Vercel account** (free tier works) – [Sign up here](https://vercel.com/signup)
- ✅ **Git repository** on GitHub, GitLab, or Bitbucket
- ✅ **OpenAI API key** (optional, for AI features) – [Get one here](https://platform.openai.com/api-keys)
- ✅ **Vercel CLI** installed globally (optional but recommended):
  ```bash
  npm install -g vercel
  ```

---

## 🔧 Prepare for Deployment

### 1. **Test Locally**

Before deploying, ensure everything works locally:

```bash
# Backend
npm start

# Frontend (in a new terminal)
cd webapp
npm run dev
```

Visit `http://localhost:5173` and verify:
- ✅ Home page loads correctly
- ✅ Camera permissions work
- ✅ Navigation between tabs works
- ✅ Parent dashboard pairing works
- ✅ AI coach responds (or demo mode displays)

### 2. **Build Frontend**

Test the production build locally:

```bash
cd webapp
npm run build
```

This creates optimized files in `webapp/dist/`. Check for build errors.

### 3. **Update Repository URLs**

In `package.json` (both root and `webapp/`), update:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/YOUR_USERNAME/sign-and-speak.git"
}
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 4. **Commit and Push**

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

---

## 🌐 Deploy to Vercel

### **Option A: Deploy via Vercel Dashboard** (Recommended for first deployment)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "Add New..." → "Project"**

3. **Import your Git repository**
   - Select GitHub/GitLab/Bitbucket
   - Authorize Vercel to access your repos
   - Find and select `sign-and-speak`

4. **Configure Project Settings**

   Vercel will auto-detect the framework, but double-check:

   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build:webapp`
   - **Output Directory**: `webapp/dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables** (See [Environment Variables](#environment-variables) section)

6. **Click "Deploy"**

   Vercel will:
   - Clone your repository
   - Install dependencies
   - Run the build
   - Deploy to a production URL (e.g., `https://sign-and-speak.vercel.app`)

7. **Visit Your Site**

   Once deployment completes, Vercel provides a URL. Test all features!

---

### **Option B: Deploy via Vercel CLI** (Faster for subsequent deployments)

1. **Login to Vercel**

   ```bash
   vercel login
   ```

2. **Run Deployment Command**

   ```bash
   vercel
   ```

   Follow the prompts:
   - **Set up and deploy?** `Y`
   - **Which scope?** (Select your account)
   - **Link to existing project?** `N` (first time) or `Y` (re-deploy)
   - **Project name?** `sign-and-speak`
   - **Directory?** `./` (press Enter)

3. **Deploy to Production**

   ```bash
   vercel --prod
   ```

   This deploys to your production domain.

---

## 🔑 Environment Variables

### **Required Variables**

| Variable | Value | Description |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `sk-proj-...` | Your OpenAI API key. Leave blank for demo mode. |

### **How to Add in Vercel Dashboard**

1. Go to **Project Settings** → **Environment Variables**
2. Click **"Add"**
3. Enter:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-YOUR_KEY_HERE`
   - **Environments**: Check `Production`, `Preview`, `Development`
4. Click **Save**

### **How to Add via CLI**

```bash
vercel env add OPENAI_API_KEY
```

When prompted:
- **Value?** Paste your OpenAI API key
- **Environments?** Select `Production` (and optionally `Preview`, `Development`)

### **Demo Mode**

If you don't have an OpenAI API key, the app works in **demo mode**:
- AI responses are simulated with placeholder text
- A **"Demo"** badge appears in the header
- All other features work normally

To enable demo mode, simply leave `OPENAI_API_KEY` blank or unset.

---

## 🌍 Custom Domain (Optional)

### **Add a Custom Domain**

1. **In Vercel Dashboard**, go to **Settings** → **Domains**
2. **Enter your domain** (e.g., `signandspeak.com`)
3. **Follow DNS configuration** instructions:
   - Add `A` record pointing to Vercel's IP
   - Or add `CNAME` record to `cname.vercel-dns.com`
4. **Wait for DNS propagation** (5-60 minutes)

Vercel automatically provisions SSL certificates (HTTPS).

---

## 🛠️ Troubleshooting

### **Build Fails**

**Error**: `Command "npm run build:webapp" exited with 1`

**Fix**:
- Check build logs in Vercel dashboard
- Ensure `webapp/package.json` has `"build": "vite build"`
- Test build locally: `cd webapp && npm run build`

---

### **API Routes Return 404**

**Error**: `/ask-gpt` or `/pair/generate` returns 404

**Fix**:
- Verify `vercel.json` routes configuration
- Ensure `server.js` is in project root
- Check Vercel deployment logs for Express server startup

---

### **Camera Doesn't Work**

**Error**: Camera permissions denied or MediaPipe fails to load

**Fix**:
- Ensure site is served over **HTTPS** (Vercel does this automatically)
- Check browser console for CORS errors
- Verify MediaPipe CDN URLs are accessible

---

### **AI Coach Returns Errors**

**Error**: `"AI is unavailable right now"`

**Fix**:
- Check Vercel environment variables: `OPENAI_API_KEY` is set correctly
- View function logs in Vercel dashboard: **Deployments** → **[Your deployment]** → **Functions**
- Verify OpenAI API key is valid: `https://platform.openai.com/api-keys`
- Check OpenAI account has credits remaining

---

### **Demo Mode Always Shows**

**Error**: Demo badge shows even with valid API key

**Fix**:
- Redeploy after adding environment variable
- Check `/env-ok` endpoint returns `{ demoMode: false }`
- Clear browser cache and hard refresh

---

## 🔄 Continuous Deployment

Vercel automatically redeploys on every `git push` to your main branch.

**To disable auto-deploy**:
1. Go to **Settings** → **Git**
2. Uncheck **"Production Branch"**
3. Deploy manually via CLI: `vercel --prod`

---

## 🌐 Alternative Platforms

### **Deploy to Netlify**

1. Connect Git repository
2. **Build command**: `npm run build:webapp`
3. **Publish directory**: `webapp/dist`
4. Add environment variables in **Site settings** → **Environment variables**

### **Deploy to Railway**

1. Create new project from GitHub repo
2. Add `OPENAI_API_KEY` environment variable
3. Railway auto-detects Node.js and runs `npm start`

### **Deploy to Render**

1. Create **Web Service** from GitHub
2. **Build Command**: `npm install && npm run build:webapp`
3. **Start Command**: `npm start`
4. Add environment variables in **Environment** tab

---

## 📊 Performance Optimization

### **Enable Caching**

Vercel automatically caches static assets. To optimize further:

1. **Add cache headers** in `vercel.json`:
   ```json
   "headers": [
     {
       "source": "/assets/(.*)",
       "headers": [
         {
           "key": "Cache-Control",
           "value": "public, max-age=31536000, immutable"
         }
       ]
     }
   ]
   ```

### **Analytics**

Enable Vercel Analytics:
1. **Project Settings** → **Analytics**
2. Toggle **Enable Analytics**
3. View real-time metrics in dashboard

---

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] Home page loads with animations
- [ ] Child interface works (camera, star rewards)
- [ ] Parent dashboard generates pairing codes
- [ ] AI coach responds (or demo mode shows)
- [ ] All navigation tabs work
- [ ] Mobile responsiveness (test on phone)
- [ ] HTTPS certificate is active
- [ ] Environment variables are set correctly
- [ ] No console errors in browser DevTools

---

## 📞 Support

If you encounter issues:

- **Vercel Docs**: https://vercel.com/docs
- **GitHub Issues**: https://github.com/YOUR_USERNAME/sign-and-speak/issues
- **Vercel Support**: support@vercel.com (Pro plan)

---

<div align="center">
  <strong>🎉 Congratulations on deploying Sign & Speak!</strong>
  <br>
  <sub>Share your deployment URL and help make communication more accessible.</sub>
</div>
