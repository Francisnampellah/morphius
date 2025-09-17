#!/bin/bash

# CloudCompare File Watcher - Local Development Setup Script

set -e

echo "🚀 Setting up CloudCompare File Watcher for local development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js v18+ and try again."
    exit 1
fi

echo "✅ Node.js version $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check for service account file
if [ -f "uploader.json" ]; then
    echo "✅ Found uploader.json service account file"
elif [ -f "service-account.json" ]; then
    echo "✅ Found service-account.json service account file"
else
    echo "⚠️  No service account file found. Please ensure you have either:"
    echo "   - uploader.json"
    echo "   - service-account.json"
    echo "   in the project root directory."
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ Created .env file. Please edit it with your Google Sheets configuration."
else
    echo "✅ .env file already exists"
fi

# Create required directories
echo "📁 Creating required directories..."
mkdir -p ~/Documents/input ~/Documents/results ~/Documents/bin
echo "✅ Created directories in ~/Documents/"

# Test Google Sheets connection
echo "🧪 Testing Google Sheets connection..."
if npm run test-sheets; then
    echo "✅ Google Sheets connection test passed!"
else
    echo "⚠️  Google Sheets connection test failed. Please check your configuration."
    echo "   Make sure to:"
    echo "   1. Set SHEET_ID and SHEET_NAME in .env file"
    echo "   2. Have a valid service account JSON file"
    echo "   3. Share your Google Sheet with the service account email"
fi

echo ""
echo "🎉 Setup complete! You can now run the watcher locally:"
echo ""
echo "   # Run the watcher"
echo "   node watcher.js"
echo ""
echo "   # Or test Google Sheets integration"
echo "   npm run test-sheets"
echo ""
echo "   # Drop your .bin and .txt files into ~/Documents/input/"
echo "   # Results will appear in ~/Documents/results/"
echo "   # .bin files will be moved to ~/Documents/bin/"
