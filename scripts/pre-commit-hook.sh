#!/bin/bash

# Pre-commit hook to prevent security issues
# Install with: cp scripts/pre-commit-hook.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

set -e

echo "🔐 Running security checks..."

# Check for hardcoded API keys
if grep -r "sk-[a-zA-Z0-9]" . --exclude-dir=node_modules --exclude-dir=dist --exclude=".env" > /dev/null 2>&1; then
    echo "❌ SECURITY VIOLATION: Hardcoded API keys found!"
    echo "   Please remove any hardcoded API keys from source code"
    echo "   Use environment variables instead"
    exit 1
fi

# Check for other potential secrets
if grep -r "password.*=.*[a-zA-Z0-9]" . --exclude-dir=node_modules --exclude-dir=dist --exclude=".env" > /dev/null 2>&1; then
    echo "❌ SECURITY VIOLATION: Potential hardcoded passwords found!"
    echo "   Please use environment variables for sensitive data"
    exit 1
fi

# Check for .env files in staging
if git diff --cached --name-only | grep -q "\.env"; then
    echo "❌ SECURITY VIOLATION: .env files should not be committed!"
    echo "   Please remove .env files from your commit"
    echo "   Use 'git reset HEAD <file>' to unstage"
    exit 1
fi

# Check for large files that might contain secrets
if git diff --cached --name-only | xargs -I {} sh -c 'test -f {} && test $(wc -c < "{}") -gt 1048576' 2>/dev/null; then
    echo "⚠️  WARNING: Large files detected (>1MB)"
    echo "   Please ensure no sensitive data is included"
fi

echo "✅ Security checks passed!"
exit 0
