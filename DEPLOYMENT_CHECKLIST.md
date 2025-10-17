# ✅ Deployment Checklist

## Pre-Deployment

- [ ] All features tested locally with `pnpm dev`
- [ ] No console errors in browser
- [ ] All API endpoints working
- [ ] Environment variables documented
- [ ] Build succeeds with `pnpm build`
- [ ] Git repository up to date

## Backend Deployment (Railway/Render)

### Railway
- [ ] Railway CLI installed: `npm i -g @railway/cli`
- [ ] Logged into Railway: `railway login`
- [ ] Project initialized: `railway init`
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5174`
  - [ ] `OPENAI_API_KEY`
  - [ ] `HUGGINGFACE_API_KEY`
  - [ ] `TYPESENSE_HOST` (if using)
  - [ ] `TYPESENSE_API_KEY` (if using)
  - [ ] `FRONTEND_URL` (your Vercel URL)
- [ ] Deployed: `railway up`
- [ ] Domain obtained: `railway domain`
- [ ] Health check working: `curl https://your-backend.railway.app/health`

### Or Render
- [ ] Account created at render.com
- [ ] New Web Service created
- [ ] Repository connected
- [ ] Build command: `cd server && pnpm install && pnpm build`
- [ ] Start command: `cd server && pnpm start`
- [ ] Environment variables added (same as Railway)
- [ ] Service deployed
- [ ] Health check working

## Frontend Deployment (Vercel)

- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Logged into Vercel: `vercel login`
- [ ] Backend URL obtained from Railway/Render
- [ ] Environment variable set:
  - [ ] `VITE_API_URL=https://your-backend-url`
- [ ] Deployed: `cd web && vercel --prod`
- [ ] Frontend accessible at Vercel URL
- [ ] No console errors

## Post-Deployment Testing

### Backend Tests
- [ ] Health endpoint: `GET /health`
- [ ] Content extraction: `POST /api/extract`
- [ ] Summarization: `POST /api/summarize`
- [ ] Q&A: `POST /api/qa`
- [ ] Search (if configured): `POST /api/search`

### Frontend Tests
- [ ] Page loads without errors
- [ ] URL bar works
- [ ] Web content extraction works
- [ ] AI Assistant panel opens
- [ ] Summarization works
- [ ] Q&A works
- [ ] File upload works (drag & drop)
- [ ] PDF generation works
- [ ] Library view works
- [ ] Search works (if configured)

### Integration Tests
- [ ] Frontend connects to backend
- [ ] API calls succeed
- [ ] CORS working properly
- [ ] No network errors
- [ ] Images/assets loading

## Optional Services

### Typesense Search (if using)
- [ ] Typesense Cloud account created
- [ ] Cluster created
- [ ] API key obtained
- [ ] Environment variables updated in backend
- [ ] Collection created automatically on first use
- [ ] Search working from frontend

### Custom Domain (optional)
- [ ] Domain purchased
- [ ] DNS configured for backend (Railway/Render)
- [ ] DNS configured for frontend (Vercel)
- [ ] SSL certificates active
- [ ] CORS updated with custom domain

## Monitoring Setup

- [ ] Vercel Analytics enabled (optional)
- [ ] Railway/Render logs accessible
- [ ] Error tracking configured (optional)
- [ ] Performance monitoring (optional)

## Documentation

- [ ] Backend URL documented
- [ ] Frontend URL documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Team members have access

## Security

- [ ] API keys not committed to git
- [ ] Environment variables properly secured
- [ ] CORS properly configured
- [ ] HTTPS enabled on both services
- [ ] Rate limiting considered (if needed)

## Rollback Plan

- [ ] Previous deployment URLs saved
- [ ] Know how to redeploy previous version
- [ ] Environment variable backup
- [ ] Database backup (if applicable)

---

## Quick Commands Reference

```bash
# Backend (Railway)
railway up                    # Deploy
railway logs                  # View logs
railway domain                # Get domain
railway variables             # List env vars

# Frontend (Vercel)
cd web
vercel --prod                 # Deploy to production
vercel logs                   # View logs
vercel env ls                 # List env vars

# Local testing
pnpm dev                      # Start both services
pnpm build                    # Build for production
```

## Troubleshooting

### Issue: Frontend can't connect to backend
- Check `VITE_API_URL` is set correctly
- Verify CORS configuration includes frontend URL
- Check network tab for actual error
- Test backend directly with curl

### Issue: Backend build fails
- Check all dependencies in `package.json`
- Verify TypeScript compiles: `cd server && pnpm build`
- Check Railway/Render build logs

### Issue: API returns errors
- Check environment variables on backend
- Verify API keys are valid
- Check backend logs for details
- Test endpoints individually

### Issue: SSL/HTTPS errors
- Wait for SSL cert to provision (can take minutes)
- Check DNS configuration
- Verify domain is correctly configured

---

## Success Criteria

✅ Frontend deployed and accessible
✅ Backend deployed and accessible  
✅ All core features working
✅ No console errors
✅ Performance acceptable
✅ URLs documented
✅ Team can access

## Next Steps After Deployment

1. Monitor logs for errors
2. Test with real users
3. Set up monitoring/analytics
4. Configure custom domain (if needed)
5. Enable additional features (search, etc.)
6. Document any issues and fixes
7. Plan for scaling if needed

---

**Need help?** Check `DEPLOYMENT_QUICKSTART.md` or `VERCEL_DEPLOYMENT.md`

