#!/bin/bash
set -e
export NODE_ENV=production
export SERVER_PORT=7770
export PORT=7771

echo "⏳ Waiting for backend to be ready..."
# Wait for backend health check
for i in {1..30}; do
    if curl -f http://localhost:${SERVER_PORT}/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    echo "🔄 Attempt $i/30 - Backend not ready yet..."
    sleep 2
done

# Check if backend is really ready
if ! curl -f http://localhost:${SERVER_PORT}/health > /dev/null 2>&1; then
    echo "❌ Backend failed to start!"
    exit 1
fi

echo "🏗️ Building frontend..."
bun run build

echo "🚀 Starting frontend..."
bun run start