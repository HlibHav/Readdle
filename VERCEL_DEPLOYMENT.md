# 🚀 Vercel Deployment Guide

This guide will help you deploy the AI-agentic Web Browser to Vercel.

## ⚠️ Important Notes

Due to the complexity of this application (Phoenix observability, Puppeteer, FAISS, etc.), we recommend a **hybrid deployment approach**:

1. **Frontend (web)**: Deploy to Vercel ✅
2. **Backend (server)**: Deploy to Railway, Render, or similar ⚠️

Vercel's serverless functions have limitations that may not work well with:
- Puppeteer (large binary size)
- Phoenix AI Observability (persistent connections)
- FAISS vector database (memory requirements)
- Typesense (separate service)

## 📋 Deployment Options

### Option 1: Frontend-Only on Vercel (Recommended)

Deploy only the frontend to Vercel and host the backend elsewhere.

#### Step 1: Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to the web directory
cd web

# Deploy
vercel
```

#### Step 2: Deploy Backend to Railway/Render

**Railway (Recommended):**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Navigate to server directory
cd server

# Initialize and deploy
railway init
railway up
```

**Render:**
1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service
4. Set build command: `cd server && pnpm install && pnpm build`
5. Set start command: `cd server && pnpm start`

#### Step 3: Update Frontend Environment Variables

Create `web/.env.production`:

```bash
VITE_API_URL=https://your-backend-url.railway.app
```

### Option 2: Full Deployment on Vercel (Limited)

⚠️ This option has significant limitations due to Vercel's serverless architecture.

#### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm i -g vercel
   ```

#### Step 1: Prepare the Project

Update `web/package.json` to add build-install script:

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "vercel-build": "pnpm install && pnpm build"
  }
}
```

#### Step 2: Configure Environment Variables

Create `.env.production` in the root:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Hugging Face (for OpenELM)
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Phoenix Observability (optional - won't work on Vercel serverless)
PHOENIX_OBSERVABILITY_ENABLED=false
PHOENIX_PROJECT_NAME=documents-browser-app

# Typesense (use cloud service)
TYPESENSE_HOST=your-typesense-host.a1.typesense.net
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=your_typesense_api_key
TYPESENSE_COLLECTION_NAME=documents

# Node Environment
NODE_ENV=production
```

#### Step 3: Simplify Backend for Vercel

Create `server/api/index.ts` (Vercel serverless entry point):

```typescript
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Import only essential routes (remove Puppeteer-dependent ones)
// app.use('/api/summarize', summarizeRoute);
// app.use('/api/qa', qaRoute);
// app.use('/api/rag', ragRoute);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
```

#### Step 4: Deploy to Vercel

```bash
# From the root directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? readdle-browser
# - Directory? ./
# - Override settings? No

# Set environment variables in Vercel dashboard
# or via CLI:
vercel env add OPENAI_API_KEY production
vercel env add HUGGINGFACE_API_KEY production
# ... add all required env variables

# Deploy to production
vercel --prod
```

## 🔧 Alternative: Separate Deployments (Best Practice)

### Frontend on Vercel

1. Create a new directory for frontend-only deployment:

```bash
# Create vercel.json in web directory
cd web
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF

# Deploy
vercel --prod
```

2. Update API calls in frontend to point to your backend URL:

```typescript
// web/src/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174';
```

### Backend on Railway

1. Create `railway.json` in server directory:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. Deploy:

```bash
cd server
railway init
railway up
```

### Backend on Render

1. Create `render.yaml`:

```yaml
services:
  - type: web
    name: readdle-browser-api
    env: node
    region: oregon
    plan: starter
    buildCommand: cd server && pnpm install && pnpm build
    startCommand: cd server && pnpm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: OPENAI_API_KEY
        sync: false
      - key: HUGGINGFACE_API_KEY
        sync: false
```

## 🌐 Environment Variables Setup

### Vercel Dashboard

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required variables:
   - `OPENAI_API_KEY`
   - `HUGGINGFACE_API_KEY`
   - `TYPESENSE_HOST`
   - `TYPESENSE_PORT`
   - `TYPESENSE_PROTOCOL`
   - `TYPESENSE_API_KEY`
   - `TYPESENSE_COLLECTION_NAME`

### CLI Method

```bash
vercel env add OPENAI_API_KEY production
vercel env add HUGGINGFACE_API_KEY production
# ... repeat for all variables
```

## 🔍 Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] Environment variables configured
- [ ] API connection from frontend to backend working
- [ ] CORS configured correctly
- [ ] OpenAI API key working
- [ ] Typesense search working (if using cloud service)
- [ ] Test core features:
  - [ ] Content extraction
  - [ ] Summarization
  - [ ] Q&A
  - [ ] File upload
  - [ ] Search functionality

## 🐛 Troubleshooting

### Build Fails on Vercel

**Issue**: Build timeout or memory errors

**Solution**: 
- Increase function memory in `vercel.json`
- Remove heavy dependencies (Puppeteer, FAISS)
- Deploy backend separately

### API Routes Not Working

**Issue**: 404 errors on API endpoints

**Solution**:
- Check `vercel.json` routing configuration
- Ensure serverless functions are in correct directory
- Check function logs in Vercel dashboard

### CORS Errors

**Issue**: Frontend can't connect to backend

**Solution**:
```typescript
// server/src/index.ts
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

### Environment Variables Not Loading

**Issue**: API keys not found

**Solution**:
- Verify variables are set in Vercel dashboard
- Redeploy after adding new variables
- Check variable names match exactly

## 📊 Monitoring & Analytics

### Vercel Analytics

Enable in `vercel.json`:

```json
{
  "analytics": true
}
```

### Custom Monitoring

Since Phoenix won't work on Vercel serverless, consider:
- Vercel's built-in monitoring
- External services like DataDog, New Relic
- Simple logging to external service

## 💡 Recommendations

1. **Development**: Use local setup with `pnpm dev`
2. **Staging**: Deploy to Vercel preview deployments
3. **Production**: 
   - Frontend → Vercel
   - Backend → Railway/Render/DigitalOcean
   - Typesense → Typesense Cloud
   - Phoenix → Self-hosted or disabled

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Typesense Cloud](https://cloud.typesense.org)

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Review function logs in dashboard
3. Test API endpoints directly
4. Verify environment variables
5. Check CORS configuration

---

**Next Steps**: Choose your deployment strategy and follow the relevant section above!

