#!/bin/bash

# Setup script for unified search functionality
# This script sets up Typesense and initializes the search system

set -e

echo "🔍 Setting up Unified Search System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Navigate to server directory
cd "$(dirname "$0")/../server"

echo "📦 Starting Typesense container..."
docker-compose up -d typesense

echo "⏳ Waiting for Typesense to be ready..."
sleep 10

# Check if Typesense is responding
echo "🔍 Checking Typesense health..."
if curl -f http://localhost:8108/health > /dev/null 2>&1; then
    echo "✅ Typesense is running and healthy"
else
    echo "❌ Typesense health check failed. Please check the logs:"
    echo "   docker logs typesense-search"
    exit 1
fi

echo "📚 Installing Typesense dependency..."
if [ -f "package.json" ]; then
    npm install typesense@^1.7.0
    echo "✅ Typesense dependency installed"
else
    echo "⚠️  package.json not found. Please run 'npm install typesense@^1.7.0' manually."
fi

echo "🔧 Setting up environment variables..."
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Created .env file from env.example"
        echo "📝 Please update the TYPESENSE_API_KEY in .env if needed"
    else
        echo "⚠️  env.example not found. Please create .env file manually."
    fi
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Search system setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the development server: pnpm dev"
echo "   2. Open http://localhost:5173"
echo "   3. Try searching in the URL bar (enter text, not a URL)"
echo "   4. Check search results at /search?q=your-query"
echo ""
echo "🔍 Search features:"
echo "   • Documents are automatically indexed when added"
echo "   • Web search is disabled in incognito mode"
echo "   • Search results show documents first, then web results"
echo "   • Full-text search with typo tolerance"
echo ""
echo "📊 Monitor Typesense:"
echo "   • Health: http://localhost:8108/health"
echo "   • Logs: docker logs typesense-search"
echo "   • Stats: GET /api/search/stats"
echo ""
echo "🛠️  Troubleshooting:"
echo "   • If search doesn't work, check Typesense logs"
echo "   • Restart Typesense: docker-compose restart typesense"
echo "   • Check environment variables in .env"
echo ""

