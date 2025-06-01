#!/bin/bash
set -e
export NODE_ENV=production

echo "🏗️ Building backend..."
bun run build

# Copy HTML files with directory structure
find src -name "*.html" -exec cp --parents {} dist/ \; 2>/dev/null || true

# Copy TXT files with directory structure  
find src -name "*.txt" -exec cp --parents {} dist/ \; 2>/dev/null || true

echo "🚀 Starting backend..."
bun run start