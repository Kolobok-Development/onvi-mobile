#!/bin/bash

# Setup script for deploying reverse proxy to Timeweb
# Run this after creating the GitHub repository

REPO_URL="https://github.com/Kolobok-Development/onvi-reverse-proxy.git"

echo "Setting up reverse proxy deployment..."
echo "Make sure you have created the GitHub repo: $REPO_URL"

# Initialize git if not already done
if [ ! -d .git ]; then
    git init
    git add .
    git commit -m "Initial reverse proxy setup"
fi

# Add remote
git remote remove origin 2>/dev/null
git remote add origin $REPO_URL

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin master

echo "Done! Now you can deploy to Timeweb using the MCP tools."




