#!/bin/bash

# Backend Deployment Script for Railway
# This script automates the deployment of the backend to Railway

set -e  # Exit on error

echo "🚀 Deploying Backend to Railway..."
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Navigate to project root
cd "$(dirname "$0")/.."

echo "📦 Building backend locally to check for errors..."
cd server
pnpm install
pnpm build
cd ..

echo ""
echo "✅ Build successful! Proceeding with deployment..."
echo ""

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway:"
    railway login
fi

# Check if project is already linked
if [ ! -f "railway.json" ]; then
    echo "⚠️  Railway project not initialized."
    read -p "Do you want to initialize a new Railway project? (y/n): " init_choice
    
    if [ "$init_choice" = "y" ]; then
        railway init
    else
        echo "❌ Cannot deploy without Railway project. Exiting."
        exit 1
    fi
fi

echo ""
echo "🔧 Setting environment variables..."
echo ""

# Function to set environment variable
set_env_var() {
    local var_name=$1
    local var_description=$2
    local is_required=$3
    
    if railway variables get "$var_name" &> /dev/null; then
        echo "✅ $var_name already set"
    else
        echo "❓ $var_name not found"
        if [ "$is_required" = "true" ]; then
            read -p "Enter value for $var_name ($var_description): " var_value
            if [ -n "$var_value" ]; then
                railway variables set "$var_name=$var_value"
                echo "✅ $var_name set"
            else
                echo "❌ $var_name is required. Exiting."
                exit 1
            fi
        else
            read -p "Enter value for $var_name (optional, $var_description) [press Enter to skip]: " var_value
            if [ -n "$var_value" ]; then
                railway variables set "$var_name=$var_value"
                echo "✅ $var_name set"
            else
                echo "⏭️  Skipped $var_name"
            fi
        fi
    fi
    echo ""
}

# Set required environment variables
set_env_var "NODE_ENV" "production" true
set_env_var "PORT" "5174" true
set_env_var "OPENAI_API_KEY" "Your OpenAI API key" true
set_env_var "HUGGINGFACE_API_KEY" "Your Hugging Face API key" false

# Optional variables
set_env_var "PHOENIX_OBSERVABILITY_ENABLED" "false (set to true if using Phoenix)" false
set_env_var "TYPESENSE_HOST" "Your Typesense host" false
set_env_var "TYPESENSE_PORT" "443" false
set_env_var "TYPESENSE_PROTOCOL" "https" false
set_env_var "TYPESENSE_API_KEY" "Your Typesense API key" false

echo ""
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✨ Deployment complete!"
echo ""
echo "📝 Getting your backend URL..."
railway domain

echo ""
echo "📝 Next steps:"
echo "1. Copy the backend URL from above"
echo "2. Use this URL as VITE_API_URL when deploying frontend"
echo "3. Test the backend health endpoint: <your-url>/api/health"
echo ""

