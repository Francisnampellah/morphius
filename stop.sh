#!/bin/bash

# CloudCompare Watcher Docker Stop Script

echo "🛑 Stopping CloudCompare File Watcher..."

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Please run this script from the project directory."
    exit 1
fi

# Stop and remove containers
docker-compose down

echo "✅ CloudCompare File Watcher stopped successfully!"
