#!/bin/bash
# Final Deployment Script - Updated with correct Railway syntax

cd /Users/Glebazzz/Readdle

echo "🚀 Final Deployment Step"
echo ""
echo "Step 1: Railway Login"
echo "Please complete the Railway authentication in your browser..."
railway login
echo ""

echo "Step 2: Initialize Railway Project"
railway init --name readdle-browser-backend
echo ""

echo "Step 3: Deploy Backend & Set Environment Variables"
# Deploy first
railway up
echo ""

# Set all environment variables with correct syntax
echo "Setting environment variables..."
railway variables --set "OPENAI_API_KEY=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" \
  --set "HUGGINGFACE_API_KEY=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" \
  --set "NODE_ENV=production" \
  --set "PORT=5174" \
  --set "PHOENIX_OBSERVABILITY_ENABLED=false"
echo ""

# Get backend URL
echo "Getting backend URL..."
BACKEND_URL=$(railway domain | grep -o 'https://[^ ]*' | head -1)
if [ -z "$BACKEND_URL" ]; then
  echo "Generating Railway domain..."
  railway domain
  BACKEND_URL=$(railway domain | grep -o 'https://[^ ]*' | head -1)
fi
echo "Backend URL: $BACKEND_URL"
echo ""

echo "Step 4: Deploy Frontend to Vercel"
cd /Users/Glebazzz/Readdle/web

# Link or create new project
vercel --yes || vercel link --yes || true

# Set environment variable
echo "Setting frontend environment variable..."
vercel env rm VITE_API_URL production --yes || true
echo "$BACKEND_URL" | vercel env add VITE_API_URL production

# Deploy
echo "Deploying frontend..."
vercel --prod --yes
echo ""

echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "📝 Your Live URLs:"
echo "Backend:  $BACKEND_URL"
echo "Frontend: Check the Vercel output above for your frontend URL"
echo ""
echo "🧪 Test your backend:"
echo "curl $BACKEND_URL/health"
echo ""

