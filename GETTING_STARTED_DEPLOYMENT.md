# 🚀 Getting Started with Deployment

## Welcome!

This guide will help you deploy your AI-powered document browser to production in **less than 10 minutes**.

---

## 📋 What You Need

Before you start, make sure you have:

- ✅ A **GitHub account** (for code repository)
- ✅ A **Vercel account** (free) - [Sign up here](https://vercel.com/signup)
- ✅ A **Railway account** (free $5 credit) - [Sign up here](https://railway.app)
- ✅ An **OpenAI API key** - [Get one here](https://platform.openai.com/api-keys)
- ✅ Node.js installed (v18+)
- ✅ pnpm installed (`npm i -g pnpm`)

---

## 🎯 Deployment in 3 Steps

### Step 1: Install CLI Tools (1 minute)

```bash
# Install Vercel CLI
npm install -g vercel

# Install Railway CLI
npm install -g @railway/cli

# Login to both services
vercel login
railway login
```

### Step 2: Deploy Backend (3 minutes)

```bash
# Option A: Use automated script (recommended)
./scripts/deploy-backend.sh

# Option B: Manual deployment
railway init
railway up

# Set environment variables
railway variables set OPENAI_API_KEY=sk-your-key-here
railway variables set NODE_ENV=production
railway variables set PORT=5174

# Get your backend URL
railway domain
# Example output: https://readdle-production.up.railway.app
```

**⚠️ IMPORTANT:** Copy your backend URL - you'll need it in the next step!

### Step 3: Deploy Frontend (3 minutes)

```bash
# Option A: Use automated script (recommended)
./scripts/deploy-frontend.sh

# Option B: Manual deployment
cd web

# Set environment variable
echo "https://your-backend.railway.app" | vercel env add VITE_API_URL production

# Deploy
vercel --prod
```

---

## ✅ Verify Deployment

### Test Backend
```bash
# Replace with your Railway URL
curl https://your-backend.railway.app/health

# Expected response:
# {"status":"ok","timestamp":"2024-10-17T..."}
```

### Test Frontend
1. Open your Vercel URL in browser
2. Try loading a webpage (e.g., `https://example.com`)
3. Click "✨ Assistant" button
4. Try "Summarize Page"
5. Check browser console for errors (should be none)

---

## 🎉 Success!

If everything works, congratulations! Your app is now live:

- 🌐 **Frontend**: `https://your-app.vercel.app`
- 🔧 **Backend**: `https://your-backend.railway.app`

---

## 📚 What's Next?

### Immediate Next Steps
1. ✅ Bookmark your URLs
2. ✅ Share with team members
3. ✅ Set up custom domain (optional)
4. ✅ Enable monitoring/analytics

### Optional Enhancements
- **Custom Domain**: Add your own domain in Vercel/Railway dashboards
- **Analytics**: Enable Vercel Analytics for usage tracking
- **Search**: Set up Typesense for advanced search features
- **Monitoring**: Configure error tracking and performance monitoring

### Learn More
- **[DEPLOY.md](./DEPLOY.md)** - Quick deployment overview
- **[DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)** - Detailed step-by-step guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Complete deployment checklist
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Comprehensive documentation

---

## 🐛 Troubleshooting

### Problem: "Frontend can't connect to backend"

**Solution:**
```bash
# Check environment variable
cd web
vercel env ls

# If VITE_API_URL is missing or wrong:
vercel env rm VITE_API_URL production
vercel env add VITE_API_URL production
# Enter: https://your-backend.railway.app

# Redeploy
vercel --prod
```

### Problem: "Backend returns errors"

**Solution:**
```bash
# Check logs
railway logs

# Verify environment variables
railway variables

# Common fix: Make sure OPENAI_API_KEY is set
railway variables set OPENAI_API_KEY=sk-your-key-here
```

### Problem: "CORS errors in browser"

**Solution:**
The backend CORS is already configured to accept Vercel domains. If you still see errors:
```bash
# Set your frontend URL in backend
railway variables set FRONTEND_URL=https://your-app.vercel.app
```

### Problem: "Build fails"

**Solution:**
```bash
# Test build locally first
pnpm install
pnpm build

# If local build works, check deployment logs:
railway logs      # For backend
vercel logs       # For frontend
```

---

## 💡 Pro Tips

1. **Use Automated Scripts**: The `deploy-backend.sh` and `deploy-frontend.sh` scripts handle most setup automatically

2. **Preview Deployments**: Every git branch gets a preview URL on Vercel - perfect for testing

3. **Environment Variables**: Never commit API keys to git. Always use environment variables

4. **Logs Are Your Friend**: When something breaks, check logs first:
   ```bash
   railway logs --follow    # Backend (live tail)
   vercel logs             # Frontend
   ```

5. **Free Tier Limits**:
   - **Vercel**: 100GB bandwidth/month (plenty for most apps)
   - **Railway**: $5 credit/month (good for ~500 hours)
   - **Upgrade**: Only when you need more

---

## 📊 Cost Estimate

### Free Tier (Perfect for testing & small projects)
- **Vercel**: $0/month (generous free tier)
- **Railway**: $0/month ($5 credit covers basic usage)
- **OpenAI**: Pay per use (~$1-5/month for light usage)
- **Total**: ~$1-5/month

### Production Ready
- **Vercel Pro**: $20/month (more bandwidth)
- **Railway Pro**: $20/month (always-on, more resources)
- **OpenAI**: Variable based on usage
- **Total**: ~$40-80/month

---

## 🔐 Security Checklist

Before going live:
- [ ] API keys stored as environment variables (not in code)
- [ ] HTTPS enabled (automatic with Vercel/Railway)
- [ ] CORS properly configured
- [ ] Rate limiting considered (for production)
- [ ] Error messages don't leak sensitive info

---

## 🆘 Still Need Help?

1. **Check Documentation**: All guides are in the root directory
2. **Check Logs**: Most issues show up in logs
3. **Test Locally First**: Make sure `pnpm dev` works
4. **Check Environment Variables**: 90% of issues are env vars
5. **Review Checklist**: Use `DEPLOYMENT_CHECKLIST.md`

---

## 🎓 Understanding Your Setup

```
┌────────────────────────────────────────┐
│            Users                       │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│   Vercel (Frontend - Static React)    │
│   - Fast global CDN                    │
│   - Automatic HTTPS                    │
│   - Zero config needed                 │
└───────────────┬────────────────────────┘
                │
                │ API Calls
                ▼
┌────────────────────────────────────────┐
│   Railway (Backend - Node.js API)     │
│   - AI/ML processing                   │
│   - OpenAI integration                 │
│   - Business logic                     │
└───────────────┬────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│   OpenAI API (AI Processing)          │
│   - Content analysis                   │
│   - Summarization                      │
│   - Q&A                                │
└────────────────────────────────────────┘
```

---

**Ready to deploy?** Start with Step 1 above! 🚀

**Questions?** Check the detailed guides linked throughout this document.

**Found a bug?** Check the troubleshooting section above.

Happy deploying! 🎉

