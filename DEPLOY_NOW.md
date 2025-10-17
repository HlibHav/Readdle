# 🚀 Deploy NOW - Copy & Paste These Commands

## Just run these 3 commands in your terminal:

### Command 1: Run the deployment script
```bash
cd /Users/Glebazzz/Readdle && ./QUICK_DEPLOY_COMMANDS.sh
```

**What will happen:**
1. Your browser will open for Vercel login - click "Continue" or "Login"
2. Your browser will open for Railway login - click "Continue" or "Login"  
3. Everything else is automated! ✨

---

## OR if you prefer manual control:

### Step 1: Authenticate
```bash
cd /Users/Glebazzz/Readdle
vercel login    # Opens browser - login and press Enter
railway login   # Opens browser - login and press Enter
```

### Step 2: Deploy Backend
```bash
# Initialize Railway
railway init

# Set environment variables
railway variables --set "OPENAI_API_KEY=your-openai-api-key-here" --set "HUGGINGFACE_API_KEY=your-huggingface-api-key-here" --set "NODE_ENV=production" --set "PORT=5174"

# Deploy
railway up

# Get your backend URL
railway domain
```

### Step 3: Deploy Frontend
```bash
cd web

# Set backend URL (replace with your Railway URL from above)
echo "https://your-backend.railway.app" | vercel env add VITE_API_URL production

# Deploy
vercel --prod
```

---

## ✅ That's it!

Your app will be live in about 2-3 minutes! 🎉

