# 🚀 Deploy Your App - Complete Guide

## 🎯 Overview

This application is a **monorepo** with two parts:
- **Frontend** (`web/`) - React + Vite → Deploy to **Vercel**
- **Backend** (`server/`) - Node.js + Express → Deploy to **Railway** or **Render**

## ⚡ Fastest Way to Deploy (5 minutes)

### Prerequisites
```bash
# Install CLI tools
npm i -g vercel @railway/cli

# Login to services
vercel login
railway login
```

### Step 1: Deploy Backend (2 minutes)
```bash
# Run automated script
./scripts/deploy-backend.sh

# Or manually:
railway init
railway up
railway domain  # Copy this URL!
```

### Step 2: Deploy Frontend (2 minutes)
```bash
# Run automated script
./scripts/deploy-frontend.sh

# Or manually:
cd web
vercel --prod
# When prompted, add VITE_API_URL with your Railway URL
```

### Step 3: Test (1 minute)
```bash
# Test backend
curl https://your-backend.railway.app/health

# Test frontend
# Open your Vercel URL in browser
```

## 📚 Detailed Documentation

- **[DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)** - Step-by-step quick guide
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Comprehensive deployment guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Complete checklist

## 🔑 Required Environment Variables

### Backend (Railway/Render)
```bash
NODE_ENV=production
PORT=5174
OPENAI_API_KEY=sk-...
HUGGINGFACE_API_KEY=hf_...  # Optional
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://your-backend.railway.app
```

## 🎨 Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Users / Browsers                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│    Vercel CDN (Frontend)                 │
│    - Static React App                    │
│    - Global CDN Distribution             │
│    - HTTPS Automatic                     │
│    URL: your-app.vercel.app              │
└──────────────┬───────────────────────────┘
               │
               │ API Calls (HTTPS)
               ▼
┌──────────────────────────────────────────┐
│    Railway/Render (Backend)              │
│    - Node.js Express Server              │
│    - AI/ML Processing                    │
│    - Database Connections                │
│    URL: your-backend.railway.app         │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│    External Services                     │
│    - OpenAI API                          │
│    - Hugging Face API                    │
│    - Typesense (optional)                │
└──────────────────────────────────────────┘
```

## 🛠️ Platform Comparison

| Feature | Vercel | Railway | Render |
|---------|--------|---------|--------|
| **Best For** | Frontend | Backend | Backend |
| **Free Tier** | ✅ Yes | ✅ $5 credit | ✅ Limited |
| **Setup Time** | 2 min | 2 min | 5 min |
| **Auto Deploy** | ✅ GitHub | ✅ GitHub | ✅ GitHub |
| **Custom Domain** | ✅ Free | ✅ Free | ✅ Free |
| **SSL** | ✅ Auto | ✅ Auto | ✅ Auto |

## 📝 Common Deployment Scenarios

### Scenario 1: First Time Deployment

```bash
# 1. Clone and setup
git clone <your-repo>
cd Readdle
pnpm install

# 2. Test locally
pnpm dev

# 3. Deploy backend
./scripts/deploy-backend.sh

# 4. Deploy frontend
./scripts/deploy-frontend.sh
```

### Scenario 2: Update Existing Deployment

```bash
# Update code
git pull

# Rebuild and redeploy backend
cd server
pnpm build
railway up

# Rebuild and redeploy frontend
cd ../web
vercel --prod
```

### Scenario 3: Environment Variable Update

```bash
# Backend
railway variables set OPENAI_API_KEY=new-key

# Frontend
vercel env add VITE_API_URL production
# Enter new backend URL
vercel --prod  # Redeploy to apply
```

## 🔍 Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Frontend can't connect to backend | Check `VITE_API_URL` environment variable |
| CORS error | Update CORS config in `server/src/index.ts` |
| Build fails | Check logs: `railway logs` or Vercel dashboard |
| API returns 500 | Check backend env vars are set |
| Slow cold starts (Render free) | Upgrade to paid tier or use Railway |

## ✅ Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible  
- [ ] Environment variables configured
- [ ] Health endpoint working: `/health`
- [ ] Frontend connects to backend
- [ ] Test core features:
  - [ ] Content extraction
  - [ ] AI summarization
  - [ ] Q&A functionality
  - [ ] File upload
  - [ ] Library view

## 🎯 Post-Deployment

### Monitor Your App
```bash
# Backend logs
railway logs --follow

# Frontend logs
vercel logs

# Check status
curl https://your-backend.railway.app/health
```

### Set Up Custom Domain (Optional)
```bash
# Vercel (Frontend)
vercel domains add yourdomain.com

# Railway (Backend)
# Add domain in Railway dashboard
```

## 💡 Pro Tips

1. **Use Preview Deployments**: Push to a branch → Auto preview deployment
2. **Set Up GitHub Actions**: Auto-deploy on push to main
3. **Enable Analytics**: Track usage with Vercel Analytics
4. **Monitor Costs**: Check Railway/Render usage regularly
5. **Use Environment-Specific Configs**: Different configs for dev/staging/prod

## 🆘 Need Help?

1. Check the detailed guides in the links above
2. Review logs in Railway/Vercel dashboard
3. Test backend directly with `curl`
4. Check browser console for frontend errors
5. Verify all environment variables are set

## 📞 Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Render Docs**: [render.com/docs](https://render.com/docs)

---

## Quick Command Reference

```bash
# Backend (Railway)
railway up                    # Deploy
railway logs                  # View logs  
railway variables             # List env vars
railway domain                # Get URL

# Frontend (Vercel)
cd web
vercel --prod                 # Deploy production
vercel logs                   # View logs
vercel env ls                 # List env vars

# Local Development
pnpm dev                      # Start all services
pnpm build                    # Build for production
```

---

**Ready to deploy?** Start with `./scripts/deploy-backend.sh` 🚀

