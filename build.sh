#!/usr/bin/env bash
set -e  # Exit on error

echo "Starting build process..."

# Python setup
echo "Setting up Python environment..."
python -m pip install --upgrade pip
pip install -r requirements.txt

# Node.js setup
echo "Setting up Node.js environment..."
npm install
npm run build

echo "Build completed successfully!"