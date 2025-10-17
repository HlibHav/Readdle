# 🚀 Quick Deployment Guide

## TL;DR - Fastest Way to Deploy

### 1️⃣ Deploy Frontend to Vercel (2 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Go to web directory
cd web

# Create vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "pnpm install && pnpm build",
  "outputDirectory": "dist",
  "framework": "vite"
}
EOF

# Deploy
vercel --prod
```

### 2️⃣ Deploy Backend to Railway (3 minutes)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# From project root
railway init

# Deploy
railway up

# Add environment variables
railway variables set OPENAI_API_KEY=your_key_here
railway variables set HUGGINGFACE_API_KEY=your_key_here
```

### 3️⃣ Connect Frontend to Backend (1 minute)

```bash
# Get your Railway backend URL (e.g., https://readdle-production.up.railway.app)

# Add to Vercel environment variable
cd web
vercel env add VITE_API_URL production
# Enter your Railway URL when prompted

# Redeploy
vercel --prod
```

---

## 📝 Detailed Steps

### Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Railway Account](https://railway.app) or [Render Account](https://render.com/register)
- GitHub repository (optional but recommended)

### Step 1: Prepare Your Project

```bash
# Make sure all dependencies are installed
pnpm install

# Test locally first
pnpm dev

# Build to check for errors
pnpm build
```

### Step 2: Deploy Backend (Choose One)

#### Option A: Railway (Recommended - Easiest)

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Create New Project**
   ```bash
   # From project root
   railway init
   # Name: readdle-browser-backend
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Set Environment Variables**
   ```bash
   railway variables set OPENAI_API_KEY=sk-...
   railway variables set HUGGINGFACE_API_KEY=hf_...
   railway variables set NODE_ENV=production
   railway variables set PORT=5174
   ```

6. **Get Your Backend URL**
   ```bash
   railway domain
   # Or check dashboard: https://railway.app
   # Example: https://readdle-production.up.railway.app
   ```

#### Option B: Render (More Configuration)

1. **Go to [render.com](https://render.com)**

2. **Create New Web Service**
   - Connect your GitHub repo
   - Or use "Deploy from Git URL"

3. **Configure Service**
   - **Name**: `readdle-browser-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`

4. **Set Environment Variables**
   Add in the "Environment" tab:
   - `OPENAI_API_KEY`
   - `HUGGINGFACE_API_KEY`
   - `NODE_ENV=production`
   - `PORT=5174`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes first time)
   - Get your URL: `https://your-app.onrender.com`

#### Option C: DigitalOcean App Platform

1. **Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)**

2. **Create App**
   - Connect GitHub repo
   - Choose "Node.js" app

3. **Configure**
   - **HTTP Port**: 5174
   - **Build Command**: `cd server && pnpm install && pnpm build`
   - **Run Command**: `cd server && pnpm start`

4. **Add Environment Variables**
   Same as above

### Step 3: Deploy Frontend to Vercel

#### Using Vercel CLI (Recommended)

```bash
# From project root
cd web

# Create vercel.json for this directory
cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "pnpm install && pnpm build",
  "outputDirectory": "dist",
  "framework": "vite"
}
EOF

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variable for API URL
vercel env add VITE_API_URL production
# Enter your Railway/Render URL: https://your-backend.railway.app

# Redeploy with env variable
vercel --prod
```

#### Using Vercel Dashboard (Alternative)

1. **Go to [vercel.com/new](https://vercel.com/new)**

2. **Import Git Repository**
   - Connect your GitHub account
   - Select your repository

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `web`
   - **Build Command**: `pnpm install && pnpm build`
   - **Output Directory**: `dist`

4. **Add Environment Variables**
   - Key: `VITE_API_URL`
   - Value: `https://your-backend.railway.app`

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (~2 minutes)

### Step 4: Update API Configuration

If you need to update the API URL in your code:

```typescript
// web/src/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174';
```

Make sure all API calls use this:

```typescript
// Example API call
const response = await fetch(`${API_BASE_URL}/api/summarize`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ text: content })
});
```

### Step 5: Test Your Deployment

1. **Test Backend**
   ```bash
   curl https://your-backend.railway.app/api/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **Test Frontend**
   - Open your Vercel URL: `https://your-app.vercel.app`
   - Try loading a page
   - Test AI features (summarize, Q&A)
   - Check browser console for any errors

3. **Check CORS**
   - Make sure backend allows your frontend domain
   - Update `server/src/index.ts` if needed:
   ```typescript
   app.use(cors({
     origin: [
       'https://your-app.vercel.app',
       'http://localhost:5173' // for local development
     ],
     credentials: true
   }));
   ```

---

## 🔧 Common Issues & Solutions

### Issue: Frontend Can't Connect to Backend

**Solution**: Check environment variable
```bash
# Verify it's set correctly
vercel env ls

# Update if needed
vercel env rm VITE_API_URL production
vercel env add VITE_API_URL production

# Redeploy
vercel --prod
```

### Issue: Backend Build Fails

**Solution**: Check build logs and ensure all dependencies are listed
```bash
# Railway: Check logs in dashboard
railway logs

# Render: Check build logs in dashboard
```

### Issue: API Returns 500 Errors

**Solution**: Check environment variables are set on backend
```bash
# Railway
railway variables

# Check if OPENAI_API_KEY and HUGGINGFACE_API_KEY are set
```

### Issue: CORS Errors

**Solution**: Update CORS configuration in `server/src/index.ts`
```typescript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://your-app.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

---

## 📊 Cost Estimates

### Free Tier (Perfect for Testing)

- **Vercel**: Free for personal projects
  - Bandwidth: 100GB/month
  - Build time: 6000 minutes/month

- **Railway**: $5/month credit (free for hobby)
  - Good for 1-2 backend services

- **Render**: Free tier available
  - Spins down after 15 min inactivity
  - Slower cold starts

### Production (Recommended)

- **Vercel Pro**: $20/month
  - More bandwidth & build time
  - Better performance

- **Railway Pro**: $20/month
  - Always-on services
  - More resources

- **Render Starter**: $7/month per service
  - Always-on
  - Predictable pricing

---

## 🎯 Next Steps

1. ✅ Backend deployed and accessible
2. ✅ Frontend deployed and accessible
3. ✅ Environment variables configured
4. ✅ Connection working between frontend and backend
5. 📈 Set up monitoring (optional)
6. 🔒 Configure custom domain (optional)
7. 📊 Set up analytics (optional)

---

## 🆘 Need More Help?

- Full deployment guide: See `VERCEL_DEPLOYMENT.md`
- Architecture details: See `ARCHITECTURE.md`
- Security setup: See `SECURITY.md`

Happy deploying! 🚀

