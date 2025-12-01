#!/bin/bash
# Setup Script for Santrilogy AI GitHub Repository

echo "========================================="
echo "SANTRILOGY AI - GitHub Setup Instructions"
echo "========================================="

echo ""
echo "Before running this script, you need to:"
echo "1. Create a GitHub repository named 'santrilogy-ai'"
echo "2. Get your repository URL (e.g., https://github.com/yourusername/santrilogy-ai.git)"
echo ""

# Ask for the repository URL
read -p "Enter your GitHub repository URL: " REPO_URL

# Validate the URL
if [[ ! $REPO_URL =~ ^https://github\.com/.*\.git$ ]]; then
    echo "Invalid GitHub URL format. Please use format: https://github.com/username/repository.git"
    exit 1
fi

echo ""
echo "Setting up remote origin..."
git remote add origin "$REPO_URL"

if [ $? -eq 0 ]; then
    echo "✅ Remote origin added successfully!"
else
    echo "❌ Failed to add remote origin"
    exit 1
fi

echo ""
echo "Current remotes:"
git remote -v

echo ""
echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Repository has been pushed to GitHub"
    echo ""
    echo "CDN URL for your JavaScript file:"
    echo "https://cdn.jsdelivr.net/gh/$(echo $REPO_URL | sed 's/https:\/\/github.com\///' | sed 's/\.git$//')@main/optimized-assets/js/app.js"
    echo ""
    echo "Remember to update your template to use the CDN URL above."
else
    echo "❌ Push failed. You may need to force push or check your permissions."
    echo "Try: git push --set-upstream origin main --force"
fi