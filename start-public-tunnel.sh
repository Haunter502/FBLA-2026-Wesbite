#!/bin/bash

echo "Starting public tunnel for your Next.js app..."
echo "Your site is running on http://localhost:3000"
echo ""
echo "Starting Cloudflare Tunnel..."
echo ""

# Start cloudflared and capture the URL
npx --yes cloudflared tunnel --url http://localhost:3000 2>&1 | while IFS= read -r line; do
    echo "$line"
    if echo "$line" | grep -qE "https://.*trycloudflare.com"; then
        URL=$(echo "$line" | grep -oE "https://[a-zA-Z0-9-]+\.trycloudflare\.com")
        echo ""
        echo "=========================================="
        echo "🌐 PUBLIC URL: $URL"
        echo "=========================================="
        echo ""
        echo "Share this URL with your friends!"
        echo "The tunnel will stay active until you stop it (Ctrl+C)"
    fi
done

