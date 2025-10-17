# 🔄 Deployment Flow Diagram

## Complete Deployment Process

```
┌─────────────────────────────────────────────────────────────────────┐
│                       START DEPLOYMENT                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 1: Prepare Local Environment                                 │
│  ✓ Clone repository                                                 │
│  ✓ Install dependencies: pnpm install                               │
│  ✓ Test locally: pnpm dev                                           │
│  ✓ Build test: pnpm build                                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│  Step 2A: Deploy Backend  │  │  Step 2B: Deploy Frontend │
│  (Railway/Render)         │  │  (Vercel)                 │
└───────────────────────────┘  └───────────────────────────┘
                │                         │
                ▼                         ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│  Install CLI              │  │  Install CLI              │
│  $ npm i -g               │  │  $ npm i -g vercel        │
│    @railway/cli           │  │                           │
└───────────────────────────┘  └───────────────────────────┘
                │                         │
                ▼                         ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│  Login                    │  │  Login                    │
│  $ railway login          │  │  $ vercel login           │
└───────────────────────────┘  └───────────────────────────┘
                │                         │
                ▼                         ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│  Initialize Project       │  │  Navigate to Web Dir      │
│  $ railway init           │  │  $ cd web                 │
└───────────────────────────┘  └───────────────────────────┘
                │                         │
                ▼                         │
┌───────────────────────────┐            │
│  Set Environment Vars     │            │
│  REQUIRED:                │            │
│  • NODE_ENV               │            │
│  • PORT                   │            │
│  • OPENAI_API_KEY         │            │
│  OPTIONAL:                │            │
│  • HUGGINGFACE_API_KEY    │            │
│  • TYPESENSE_*            │            │
└───────────────────────────┘            │
                │                         │
                ▼                         │
┌───────────────────────────┐            │
│  Deploy                   │            │
│  $ railway up             │            │
└───────────────────────────┘            │
                │                         │
                ▼                         │
┌───────────────────────────┐            │
│  Get Backend URL          │            │
│  $ railway domain         │            │
│  Example:                 │            │
│  readdle.railway.app      │            │
└───────────────────────────┘            │
                │                         │
                │                         ▼
                │              ┌───────────────────────────┐
                │              │  Set Environment Var      │
                │              │  $ vercel env add         │
                │              │  VITE_API_URL production  │
                └──────────────┤  Enter backend URL        │
                               └───────────────────────────┘
                                          │
                                          ▼
                               ┌───────────────────────────┐
                               │  Deploy                   │
                               │  $ vercel --prod          │
                               └───────────────────────────┘
                                          │
                ┌─────────────────────────┴────────────────────────┐
                │                                                  │
                ▼                                                  ▼
┌───────────────────────────┐                    ┌───────────────────────────┐
│  Step 3: Verify Backend   │                    │  Step 4: Verify Frontend  │
│  Test health endpoint:    │                    │  Open Vercel URL          │
│  GET /health              │                    │  Test features:           │
│  Expected: 200 OK         │                    │  • Page loads             │
└───────────────────────────┘                    │  • Extract content        │
                                                 │  • AI features work       │
                                                 └───────────────────────────┘
                                                              │
                                                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 5: Integration Test                                           │
│  ✓ Frontend connects to backend                                     │
│  ✓ API calls succeed                                                 │
│  ✓ No CORS errors                                                    │
│  ✓ All features working                                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ✅ DEPLOYMENT COMPLETE                            │
│                                                                      │
│  Your App is Live!                                                   │
│  Frontend: https://your-app.vercel.app                               │
│  Backend:  https://your-backend.railway.app                          │
└─────────────────────────────────────────────────────────────────────┘
```

## Alternative: Automated Deployment

```
┌─────────────────────────────────────────────────────────────────────┐
│  Quick Deploy with Scripts                                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  $ ./scripts/deploy-backend.sh                                      │
│  (Automated backend deployment with interactive prompts)            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  $ ./scripts/deploy-frontend.sh                                     │
│  (Automated frontend deployment with interactive prompts)           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ✅ Done! Both services deployed                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Continuous Deployment (CI/CD) Flow

```
┌────────────────┐
│  Git Push      │
│  to main       │
└───────┬────────┘
        │
        ▼
┌────────────────────────────┐
│  GitHub Detects Change     │
└───────┬────────────────────┘
        │
        ├─────────────────────────────┐
        │                             │
        ▼                             ▼
┌───────────────────┐      ┌─────────────────────┐
│  Vercel Auto      │      │  Railway Auto       │
│  Deploy Frontend  │      │  Deploy Backend     │
└───────────────────┘      └─────────────────────┘
        │                             │
        ├─────────────────────────────┘
        │
        ▼
┌────────────────────────────┐
│  Automatic Testing         │
│  (If configured)           │
└───────┬────────────────────┘
        │
        ▼
┌────────────────────────────┐
│  ✅ Live Deployment         │
└────────────────────────────┘
```

## Rollback Flow

```
┌────────────────────────────┐
│  Issue Detected            │
└───────┬────────────────────┘
        │
        ▼
┌────────────────────────────┐
│  Rollback Decision         │
└───────┬────────────────────┘
        │
        ├──────────────────────────────┐
        │                              │
        ▼                              ▼
┌───────────────────┐      ┌──────────────────────┐
│  Vercel Rollback  │      │  Railway Rollback    │
│  1. Go to deploy  │      │  1. railway status   │
│  2. Click rollback│      │  2. Select prev ver  │
└───────────────────┘      │  3. railway up       │
                           └──────────────────────┘
        │                              │
        └───────┬──────────────────────┘
                │
                ▼
┌────────────────────────────┐
│  Test Previous Version     │
└───────┬────────────────────┘
        │
        ▼
┌────────────────────────────┐
│  ✅ Service Restored        │
└────────────────────────────┘
```

## Environment-Based Deployment

```
┌──────────────────────────────────────────────────────────────┐
│                     Code Repository                          │
└────────────┬─────────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────┬──────────────────┐
             │              │              │                  │
             ▼              ▼              ▼                  ▼
┌──────────────────┐ ┌──────────────┐ ┌───────────────┐ ┌─────────────┐
│  Local           │ │  Development │ │  Staging      │ │  Production │
│  Environment     │ │  Branch       │ │  Branch       │ │  Main       │
├──────────────────┤ ├──────────────┤ ├───────────────┤ ├─────────────┤
│  localhost:5173  │ │  dev-xxx     │ │  staging-xxx  │ │  your-app   │
│  localhost:5174  │ │  .vercel.app │ │  .vercel.app  │ │  .vercel.app│
└──────────────────┘ └──────────────┘ └───────────────┘ └─────────────┘
         │                   │                  │                │
         │                   │                  │                │
         ▼                   ▼                  ▼                ▼
┌──────────────────┐ ┌──────────────┐ ┌───────────────┐ ┌─────────────┐
│  Local .env      │ │  Dev Env     │ │  Staging Env  │ │  Prod Env   │
│  All services    │ │  Vars        │ │  Vars         │ │  Vars       │
└──────────────────┘ └──────────────┘ └───────────────┘ └─────────────┘
```

## Monitoring & Maintenance Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Live Application                          │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│  Continuous Monitoring                                       │
│  • Vercel Analytics (Frontend)                               │
│  • Railway Logs (Backend)                                    │
│  • Error Tracking                                            │
│  • Performance Metrics                                       │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│  Alert Triggers                                              │
│  • High Error Rate                                           │
│  • Slow Response Time                                        │
│  • Service Down                                              │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│  Response Actions                                            │
│  1. Check logs                                               │
│  2. Identify issue                                           │
│  3. Deploy fix or rollback                                   │
│  4. Verify resolution                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

**Deploy Everything:**
```bash
./scripts/deploy-backend.sh && ./scripts/deploy-frontend.sh
```

**Check Status:**
```bash
railway status && vercel inspect
```

**View Logs:**
```bash
railway logs --follow  # Backend
vercel logs            # Frontend
```

**Environment Variables:**
```bash
railway variables      # Backend
vercel env ls          # Frontend
```

