#!/bin/bash

# Get the service ID from the domain command output
SERVICE_ID=$(railway service ls 2>/dev/null | grep -v "^$" | head -1 | awk '{print $1}')

# If we can't get it, try setting vars anyway
railway variables --set "OPENAI_API_KEY=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" --service "$SERVICE_ID" 2>/dev/null || \
railway variables --set "OPENAI_API_KEY=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"

railway variables --set "HUGGINGFACE_API_KEY=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" --service "$SERVICE_ID" 2>/dev/null || \
railway variables --set "HUGGINGFACE_API_KEY=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"

railway variables --set "NODE_ENV=production" --service "$SERVICE_ID" 2>/dev/null || \
railway variables --set "NODE_ENV=production"

railway variables --set "PORT=5174" --service "$SERVICE_ID" 2>/dev/null || \
railway variables --set "PORT=5174"

railway variables --set "PHOENIX_OBSERVABILITY_ENABLED=false" --service "$SERVICE_ID" 2>/dev/null || \
railway variables --set "PHOENIX_OBSERVABILITY_ENABLED=false"

echo "Variables set!"
