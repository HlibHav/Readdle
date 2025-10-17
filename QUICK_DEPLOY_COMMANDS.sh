#!/bin/bash
# Quick Deployment Commands
# Run these commands one by one after logging into Vercel and Railway in your browser

echo "🚀 Starting deployment process..."
echo ""

# Authenticate with Vercel
echo "Step 1: Authenticate with Vercel..."
echo "Opening browser for Vercel authentication..."
vercel login
echo ""

# Authenticate with Railway
echo "Step 2: Authenticate with Railway..."
echo "Opening browser for Railway authentication..."
railway login
echo ""

# Deploy Backend to Railway
echo "Step 3: Deploying backend to Railway..."
cd /Users/Glebazzz/Readdle

# Initialize Railway project
railway init --name readdle-browser-backend

# Set environment variables
echo "Setting environment variables..."
railway variables --set "OPENAI_API_KEY=your-openai-api-key-here" --set "HUGGINGFACE_API_KEY=your-huggingface-api-key-here" --set "NODE_ENV=production" --set "PORT=5174" --set "PHOENIX_OBSERVABILITY_ENABLED=false"

# Deploy backend
echo "Deploying backend..."
railway up

# Get backend URL
echo ""
echo "Getting backend URL..."
BACKEND_URL=$(railway domain 2>&1 | grep -o 'https://[^ ]*' | head -1)
echo "Backend URL: $BACKEND_URL"
echo ""

# Deploy Frontend to Vercel
echo "Step 4: Deploying frontend to Vercel..."
cd /Users/Glebazzz/Readdle/web

# Set environment variable
echo "$BACKEND_URL" | vercel env add VITE_API_URL production

# Deploy frontend
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Your URLs:"
echo "Backend: $BACKEND_URL"
echo "Frontend: Check the output above for your Vercel URL"
echo ""

