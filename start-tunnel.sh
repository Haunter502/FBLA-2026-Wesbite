#!/bin/bash

echo "Starting public tunnel for your Next.js app..."
echo "Your site is running on http://localhost:3000"
echo ""
echo "Starting tunnel... (this may take a few seconds)"
echo ""

# Try cloudflared first (most reliable)
if command -v cloudflared &> /dev/null || npx --yes cloudflared --version &> /dev/null; then
    echo "Using Cloudflare Tunnel..."
    npx --yes cloudflared tunnel --url http://localhost:3000
elif command -v ngrok &> /dev/null || npx --yes ngrok version &> /dev/null; then
    echo "Using ngrok..."
    npx --yes ngrok http 3000
else
    echo "Using localtunnel..."
    npx --yes localtunnel --port 3000
fi

