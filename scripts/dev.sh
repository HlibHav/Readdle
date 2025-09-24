#!/bin/bash

# Documents Browser Demo - Development Script
echo "🚀 Starting Documents Browser Demo..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install:all
fi

# Check for .env file
if [ ! -f "server/.env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp server/env.example server/.env
    echo "📝 Please edit server/.env to add your OpenAI API key (optional)"
fi

echo ""
echo "🌐 Starting development servers..."
echo "   Web app: http://localhost:5173"
echo "   API server: http://localhost:5174"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers concurrently
pnpm dev
