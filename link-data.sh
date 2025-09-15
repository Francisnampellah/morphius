#!/bin/bash

# Create symlink to data directory for easier access

echo "🔗 Creating symlink to data directory..."

# Remove existing symlink if it exists
if [ -L "data" ]; then
    rm data
    echo "   Removed existing symlink"
fi

# Create symlink to the actual data directory
ln -s /tmp/cloudcompare-data data

echo "✅ Symlink created: ./data -> /tmp/cloudcompare-data"
echo ""
echo "📂 You can now access your files through:"
echo "   Input:    ./data/input/"
echo "   Results:  ./data/results/"
echo "   Bin:      ./data/bin/"
echo ""
echo "💡 The actual files are stored in /tmp/cloudcompare-data/"
