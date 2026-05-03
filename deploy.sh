#!/bin/bash

# StayClose Vercel Deployment Script
# This script prepares and deploys StayClose to Vercel

echo "🚀 StayClose Deployment Script"
echo "================================"

# Check for required environment variables
echo ""
echo "📋 Checking environment variables..."
missing_env=false

if [ -z "$NEXT_PUBLIC_CONVEX_URL" ]; then
  echo "❌ NEXT_PUBLIC_CONVEX_URL is not set"
  missing_env=true
fi

if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
  echo "❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set"
  missing_env=true
fi

if [ -z "$CLERK_SECRET_KEY" ]; then
  echo "❌ CLERK_SECRET_KEY is not set"
  missing_env=true
fi

if [ "$missing_env" = true ]; then
  echo ""
  echo "Please set the required environment variables above."
  echo "You can get these from:"
  echo "  - Convex: https://dashboard.convex.dev"
  echo "  - Clerk: https://dashboard.clerk.dev"
  exit 1
fi

echo "✅ All required environment variables are set"

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Option 1: Deploy using Vercel CLI (recommended)
# vercel --prod

# Option 2: Push to Git and let Vercel auto-deploy
echo "Make sure your code is pushed to GitHub/GitLab/Bitbucket"
echo "and connected to Vercel for automatic deployments."
echo ""

# Option 3: Manual deployment steps
echo "📦 Deployment steps:"
echo ""
echo "1. Install Vercel CLI:"
echo "   npm i -g vercel"
echo ""
echo "2. Login to Vercel:"
echo "   vercel login"
echo ""
echo "3. Deploy (from project root):"
echo "   vercel --prod"
echo ""
echo "4. Set environment variables in Vercel Dashboard:"
echo "   - NEXT_PUBLIC_CONVEX_URL"
echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "   - CLERK_SECRET_KEY"
echo "   - ANTHROPIC_API_KEY (optional, for AI features)"
echo "   - OPENAI_API_KEY (optional, for voice transcription)"
echo ""

echo "✨ Deployment complete!"
echo ""
echo "🔗 After deployment, your app will be available at:"
echo "   https://your-project.vercel.app"
echo ""
echo "📱 Don't forget to:"
echo "   - Test all features on the deployed URL"
echo "   - Configure Convex production environment"
echo "   - Update Clerk allowed origins for production"
