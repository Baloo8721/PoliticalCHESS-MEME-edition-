#!/bin/bash

# Political CHESS MEME Edition Deployment Script
# This script helps deploy the game to GitHub Pages

echo "🏁 Starting Political CHESS MEME Edition deployment to GitHub Pages..."

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "🔧 Initializing Git repository..."
    git init
fi

# Check if GitHub remote is set up
if ! git remote | grep -q origin; then
    echo "⚠️ No remote repository found."
    echo "Please enter your GitHub username:"
    read username
    
    if [ -z "$username" ]; then
        echo "❌ Error: Username cannot be empty."
        exit 1
    fi
    
    echo "Setting up remote repository..."
    git remote add origin "https://github.com/$username/PoliticalCHESS-MEME-edition-.git"
    echo "✅ Remote repository set up."
fi

# Make sure dependencies are installed
echo "🔧 Installing dependencies..."
npm install

# Install gh-pages if not already installed
if ! grep -q "gh-pages" package.json; then
    echo "🔧 Installing gh-pages package..."
    npm install --save-dev gh-pages
fi

# Build and deploy
echo "🏗️ Building and deploying to GitHub Pages..."
npm run deploy

echo "🎮 Political CHESS MEME Edition deployed successfully!"
echo "Your game should now be available at: https://$(git remote get-url origin | sed 's/.*github.com[:\/]\(.*\)\/PoliticalCHESS-MEME-edition-.*/\1/').github.io/PoliticalCHESS-MEME-edition-"
echo "Note: It may take a few minutes for changes to appear on GitHub Pages."
echo "Remember to push your changes to GitHub with: git add . && git commit -m 'Update game' && git push origin main"
