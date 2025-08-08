#!/bin/bash

# Chrome Web Store Package Creation Script
echo "🚀 Creating Chrome Web Store package for ReplyGenius..."

# Create package directory
mkdir -p chrome-store-package

# Copy essential extension files
echo "📦 Copying extension files..."
cp manifest.json chrome-store-package/
cp background.js chrome-store-package/
cp content.js chrome-store-package/
cp content.css chrome-store-package/
cp popup.js chrome-store-package/
cp popup.html chrome-store-package/
cp popup.css chrome-store-package/

# Copy icons directory
echo "🎨 Copying icons..."
cp -r icons chrome-store-package/

# Create the ZIP file
echo "📦 Creating ZIP package..."
cd chrome-store-package
zip -r ../ReplyGenius-ChromeStore-v1.0.0.zip ./*
cd ..

# Clean up temporary directory
rm -rf chrome-store-package

echo "✅ Package created: ReplyGenius-ChromeStore-v1.0.0.zip"
echo "📁 Package contents:"
unzip -l ReplyGenius-ChromeStore-v1.0.0.zip