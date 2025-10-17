#!/bin/bash
cd /Users/Glebazzz/Readdle/server

# Set environment variables for Railway
railway variables --set "OPENAI_API_KEY=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"
railway variables --set "HUGGINGFACE_API_KEY=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"
railway variables --set "NODE_ENV=production"
railway variables --set "PORT=5174"
railway variables --set "PHOENIX_OBSERVABILITY_ENABLED=false"

echo "✅ Environment variables set successfully"

