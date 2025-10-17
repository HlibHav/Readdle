#!/bin/bash
echo "🚀 Deploying CORS fix to Railway..."

# Navigate to server directory
cd /Users/Glebazzz/Readdle/server

# Build the project
echo "📦 Building project..."
pnpm build

# Commit the changes
echo "📝 Committing changes..."
git add .
git commit -m "Fix CORS configuration for production"

# Push to trigger Railway deployment
echo "🚀 Pushing to Railway..."
git push origin main

echo "✅ CORS fix deployed! Railway will automatically redeploy."
echo "⏳ Wait 2-3 minutes for deployment to complete."
echo "🔄 Then refresh your frontend: https://web-obrqtyqdn-hlibhavs-projects.vercel.app"
