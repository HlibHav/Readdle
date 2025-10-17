#!/bin/bash

# Frontend Deployment Script for Vercel
# This script automates the deployment of the frontend to Vercel

set -e  # Exit on error

echo "🚀 Deploying Frontend to Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to web directory
cd "$(dirname "$0")/../web"

echo "📦 Building frontend locally to check for errors..."
pnpm install
pnpm build

echo ""
echo "✅ Build successful! Proceeding with deployment..."
echo ""

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

# Ask for deployment type
echo "Select deployment type:"
echo "1) Preview deployment (for testing)"
echo "2) Production deployment"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "🔨 Deploying to preview..."
        vercel
        ;;
    2)
        echo "🚀 Deploying to production..."
        
        # Check if VITE_API_URL is set
        if [ -z "$(vercel env ls production | grep VITE_API_URL)" ]; then
            echo ""
            echo "⚠️  VITE_API_URL environment variable not found!"
            read -p "Enter your backend API URL (e.g., https://your-backend.railway.app): " api_url
            echo "$api_url" | vercel env add VITE_API_URL production
        fi
        
        vercel --prod
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✨ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Visit your deployment URL"
echo "2. Test the application"
echo "3. Check browser console for any errors"
echo "4. Verify API connection to backend"
echo ""

