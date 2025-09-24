#!/bin/bash

# Documents Browser Demo - Secure Setup Script
# This script helps you set up the project securely

set -e

echo "🔐 Documents Browser Demo - Secure Setup"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server/.env from env.example..."
    cp server/env.example server/.env
    echo "✅ Created server/.env"
else
    echo "ℹ️  server/.env already exists"
fi

# Check if API key is set to placeholder
if grep -q "your_openai_api_key_here" server/.env; then
    echo "⚠️  Warning: OpenAI API key is set to placeholder value"
    echo "   Please edit server/.env and add your actual API key"
    echo "   Get your API key from: https://platform.openai.com/api-keys"
    echo ""
    echo "   Current content:"
    echo "   $(head -1 server/.env)"
    echo ""
else
    echo "✅ API key appears to be configured"
fi

# Verify .gitignore
echo "🔍 Checking .gitignore configuration..."
if grep -q "\.env" .gitignore; then
    echo "✅ .env files are properly ignored"
else
    echo "❌ Warning: .env files are not in .gitignore"
fi

# Check git status for sensitive files
echo "🔍 Checking for sensitive files in git..."
if git status --porcelain | grep -q "\.env"; then
    echo "❌ Warning: .env files are tracked by git!"
    echo "   Please remove them from git tracking:"
    echo "   git rm --cached server/.env"
    echo "   git commit -m 'Remove .env from tracking'"
else
    echo "✅ No .env files tracked by git"
fi

# Security scan
echo "🔍 Running basic security scan..."
if grep -r "sk-[a-zA-Z0-9]" . --exclude-dir=node_modules --exclude-dir=dist --exclude=".env" > /dev/null 2>&1; then
    echo "❌ Warning: Potential hardcoded API keys found in source code!"
    echo "   Run: grep -r 'sk-[a-zA-Z0-9]' . --exclude-dir=node_modules --exclude-dir=dist --exclude='.env'"
else
    echo "✅ No hardcoded API keys found in source code"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit server/.env with your actual OpenAI API key"
echo "2. Run 'pnpm install' to install dependencies"
echo "3. Run 'pnpm dev' to start the development server"
echo ""
echo "For detailed security guidelines, see SECURITY.md"
