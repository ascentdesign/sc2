#!/bin/bash

# StayClose Setup and Deploy Script
# Uses GitHub CLI for repository creation and Vercel for deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║  🔗 StayClose - Setup & Deploy                             ║"
echo "║                                                            ║"
echo "║  This script will:                                         ║"
echo "║  1. Check GitHub CLI authentication                        ║"
echo "║  2. Create a new GitHub repository                         ║"
echo "║  3. Push code to GitHub                                    ║"
echo "║  4. Deploy to Vercel                                       ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps/web" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root (stayclose/)${NC}"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check requirements
echo ""
echo -e "${YELLOW}📋 Checking requirements...${NC}"

if ! command_exists git; then
    echo -e "${RED}❌ Git is not installed. Please install Git first.${NC}"
    exit 1
fi

if ! command_exists gh; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed.${NC}"
    echo "   Install it from: https://cli.github.com/"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All required tools are installed${NC}"

# Check GitHub authentication
echo ""
echo -e "${YELLOW}🔐 Checking GitHub CLI authentication...${NC}"

if gh auth status 2>&1 | grep -q "not logged into any GitHub hosts"; then
    echo -e "${RED}❌ GitHub CLI is not authenticated.${NC}"
    echo ""
    echo "   Please run: gh auth login"
    echo ""
    echo -e "${BLUE}   Or we can do it for you now...${NC}"
    read -p "   Would you like to authenticate GitHub CLI now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gh auth login
    else
        echo "   Authentication cancelled. Please run 'gh auth login' manually and try again."
        exit 1
    fi
fi

echo -e "${GREEN}✅ GitHub CLI is authenticated${NC}"

# Get repository name
GIT_USERNAME=$(gh api user -q '.login' 2>/dev/null || echo "")
if [ -z "$GIT_USERNAME" ]; then
    echo -e "${RED}❌ Could not get GitHub username. Please ensure you're logged in.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📦 Repository Setup${NC}"

# Default repo name
DEFAULT_REPO_NAME="stayclose"

# Ask for repository name
read -p "   Repository name [$DEFAULT_REPO_NAME]: " REPO_NAME
REPO_NAME=${REPO_NAME:-$DEFAULT_REPO_NAME}

# Default visibility
read -p "   Make repository public? (y/n) [y]: " -n 1 -r
REPO_VISIBILITY=${REPO_VISIBILITY:-"y"}
echo

if [[ $REPO_VISIBILITY =~ ^[Nn]$ ]]; then
    REPO_VISIBILITY="private"
else
    REPO_VISIBILITY="public"
fi

FULL_REPO_NAME="$GIT_USERNAME/$REPO_NAME"

echo ""
echo -e "${BLUE}   Creating repository: $FULL_REPO_NAME ($REPO_VISIBILITY)...${NC}"

# Check if repository already exists
if gh repo view "$FULL_REPO_NAME" 2>&1 | grep -q "could not find"; then
    # Repository doesn't exist, create it
    gh repo create "$REPO_NAME" --$REPO_VISIBILITY --source=. --push --description "StayClose - Maintain Meaningful Connections" 2>&1 || {
        echo -e "${RED}❌ Failed to create repository${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Repository created and code pushed!${NC}"
else
    # Repository exists, just push
    echo -e "${YELLOW}⚠️  Repository already exists. Pushing to existing repo...${NC}"

    # Add remote and push
    git remote add origin "https://github.com/$FULL_REPO_NAME.git" 2>/dev/null || git remote set-url origin "https://github.com/$FULL_REPO_NAME.git"
    git branch -M main
    git push -u origin main

    echo -e "${GREEN}✅ Code pushed to existing repository!${NC}"
fi

# Get the repository URL
REPO_URL="https://github.com/$FULL_REPO_NAME"
echo ""
echo -e "${GREEN}🔗 Repository URL: $REPO_URL${NC}"

# Check for Vercel CLI
echo ""
echo -e "${YELLOW}🚀 Deploying to Vercel${NC}"

if ! command_exists vercel; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm i -g vercel
fi

# Check Vercel authentication
if ! vercel whoami 2>&1 | grep -q "@"; then
    echo -e "${YELLOW}⚠️  Vercel CLI not authenticated.${NC}"
    read -p "   Would you like to login to Vercel now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vercel login
    else
        echo -e "${RED}❌ Vercel authentication required for deployment${NC}"
        echo "   Your code is on GitHub at: $REPO_URL"
        echo "   You can deploy manually from the Vercel dashboard."
        exit 1
    fi
fi

echo -e "${GREEN}✅ Vercel CLI is authenticated${NC}"

# Deploy to Vercel
echo ""
echo -e "${BLUE}   Starting Vercel deployment...${NC}"
echo ""

# Link project or deploy
if [ -d ".vercel" ]; then
    vercel --prod
else
    vercel --prod --confirm
fi

# Get deployment URL
DEPLOY_URL=$(vercel inspect --wait 2>&1 | grep -oE 'https?://[^[:space:]]+' | head -1)

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║  ✅ DEPLOYMENT COMPLETE!                                   ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
if [ -n "$DEPLOY_URL" ]; then
    echo -e "${GREEN}║  🌐 Live URL: $DEPLOY_URL                      ${NC}"
fi
echo -e "${GREEN}║  📁 GitHub: $REPO_URL ${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "   1. Visit your Vercel dashboard: https://vercel.com/dashboard"
echo "   2. Add environment variables:"
echo "      • NEXT_PUBLIC_CONVEX_URL"
echo "      • NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "      • CLERK_SECRET_KEY"
echo "      • ANTHROPIC_API_KEY (optional)"
echo "      • OPENAI_API_KEY (optional)"
echo ""
echo "   3. Configure Clerk:"
echo "      • Go to https://dashboard.clerk.dev"
echo "      • Add your Vercel domain to 'Allowed Origins'"
echo ""
echo -e "${BLUE}   Happy connecting! 🔗${NC}"
echo ""
