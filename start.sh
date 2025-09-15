#!/bin/bash

# CloudCompare Watcher Docker Startup Script

set -e

echo "🚀 Starting CloudCompare File Watcher with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create required directories if they don't exist
echo "📁 Creating required directories..."
mkdir -p /tmp/cloudcompare-data/input /tmp/cloudcompare-data/results /tmp/cloudcompare-data/bin

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Please run this script from the project directory."
    exit 1
fi

# Build and start the container
echo "🔨 Building and starting container..."
docker-compose up --build -d

# Wait a moment for the container to start
sleep 2

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Container is running successfully!"
    echo ""
    echo "📋 Useful commands:"
    echo "  View logs:     docker-compose logs -f"
    echo "  Stop:          docker-compose down"
    echo "  Restart:       docker-compose restart"
    echo "  Status:        docker-compose ps"
    echo ""
    echo "📂 Drop your .bin and .txt files into /tmp/cloudcompare-data/input/"
    echo "📊 Results will appear in /tmp/cloudcompare-data/results/"
    echo "📦 .bin files will be moved to /tmp/cloudcompare-data/bin/"
else
    echo "❌ Failed to start container. Check logs with: docker-compose logs"
    exit 1
fi
