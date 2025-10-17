# 🚀 START HERE - Deployment Guide

## Quick Deploy (Choose One)

### Option 1: Automated (Easiest) ⭐
```bash
# 1. Deploy backend
./scripts/deploy-backend.sh

# 2. Deploy frontend  
./scripts/deploy-frontend.sh
```

### Option 2: Manual (More Control)
```bash
# Install CLIs
npm i -g vercel @railway/cli

# Login
vercel login
railway login

# Deploy backend
railway init && railway up
railway variables set OPENAI_API_KEY=sk-...
railway domain  # Copy this URL!

# Deploy frontend
cd web
vercel env add VITE_API_URL production  # Paste Railway URL
vercel --prod
```

---

## 📚 Documentation Index

| File | Purpose | Read If... |
|------|---------|-----------|
| **[GETTING_STARTED_DEPLOYMENT.md](./GETTING_STARTED_DEPLOYMENT.md)** | Complete beginner guide | First time deploying |
| **[DEPLOY.md](./DEPLOY.md)** | Quick overview | Want quick reference |
| **[DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)** | Step-by-step guide | Want detailed steps |
| **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** | Checklist format | Like checklists |
| **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** | Full documentation | Want all options |
| **[DEPLOYMENT_FLOW.md](./DEPLOYMENT_FLOW.md)** | Visual diagrams | Visual learner |

---

## ⚡ Super Quick Start

```bash
# 1. Prerequisites
npm i -g vercel @railway/cli
vercel login && railway login

# 2. Deploy (paste your OpenAI key when prompted)
./scripts/deploy-backend.sh && ./scripts/deploy-frontend.sh

# 3. Done! 🎉
```

---

## 🎯 What Gets Deployed Where

| Component | Platform | Why | URL Pattern |
|-----------|----------|-----|-------------|
| Frontend | Vercel | Best for React | `*.vercel.app` |
| Backend | Railway | Best for Node.js | `*.railway.app` |

---

## 🔑 Required Environment Variables

### Backend (Railway)
```
OPENAI_API_KEY=sk-...        # Required
NODE_ENV=production          # Required
PORT=5174                    # Required
HUGGINGFACE_API_KEY=hf-...   # Optional
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.railway.app
```

---

## ✅ Success Checklist

- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Environment variables set
- [ ] Test: `curl https://your-backend.railway.app/health`
- [ ] Open frontend URL in browser
- [ ] Test: Load a webpage
- [ ] Test: Use AI Assistant

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Frontend can't connect | Check `VITE_API_URL` env var |
| Backend errors | Check `OPENAI_API_KEY` is set |
| CORS errors | Already configured, check logs |
| Build fails | Run `pnpm build` locally first |

---

## 💡 Next Steps After Deployment

1. Test all features
2. Share URLs with team
3. Set up custom domain (optional)
4. Configure monitoring (optional)

---

## 📞 Get Help

- **Logs**: `railway logs` (backend), `vercel logs` (frontend)
- **Status**: `railway status`, `vercel inspect`
- **Docs**: Check files listed in Documentation Index above

---

**Ready?** Run `./scripts/deploy-backend.sh` to start! 🚀
