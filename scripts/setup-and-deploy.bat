@echo off
chcp 65001 >nul
cls

echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║  🔗 StayClose - Setup & Deploy (Windows)                   ║
echo ║                                                            ║
echo ║  This script will:                                         ║
echo ║  1. Check GitHub CLI authentication                        ║
echo ║  2. Create a new GitHub repository                         ║
echo ║  3. Push code to GitHub                                    ║
echo ║  4. Deploy to Vercel                                       ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root (stayclose/)
    exit /b 1
)

if not exist "apps\web" (
    echo ❌ Error: Please run this script from the project root (stayclose/)
    exit /b 1
)

echo 📋 Checking requirements...

:: Check git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    exit /b 1
)
echo ✅ Git found

:: Check gh
gh --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ GitHub CLI (gh) is not installed.
    echo    Install it from: https://cli.github.com/
    exit /b 1
)
echo ✅ GitHub CLI found

:: Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install Node.js first.
    exit /b 1
)
echo ✅ npm found

:: Check GitHub authentication
echo.
echo 🔐 Checking GitHub CLI authentication...

gh auth status 2>&1 | findstr "not logged into any GitHub hosts" >nul
if %errorlevel% equ 0 (
    echo ❌ GitHub CLI is not authenticated.
    echo.
    echo Please run: gh auth login
    echo.
    echo Or login via browser and run 'gh auth login'
    exit /b 1
)

echo ✅ GitHub CLI is authenticated

:: Get repository name
echo.
echo 📦 Repository Setup

set /p REPO_NAME="Repository name [stayclose]: "
if "%REPO_NAME%"=="" set REPO_NAME=stayclose

set /p REPO_PUBLIC="Make repository public? (y/n) [y]: "
if "%REPO_PUBLIC%"=="" set REPO_PUBLIC=y

:: Get GitHub username
for /f "tokens=*" %%a in ('gh api user -q ".login" 2^>nul') do set GIT_USERNAME=%%a

if "%GIT_USERNAME%"=="" (
    echo ❌ Could not get GitHub username. Please ensure you're logged in.
    exit /b 1
)

set FULL_REPO_NAME=%GIT_USERNAME%/%REPO_NAME%

echo.
echo Creating repository: %FULL_REPO_NAME% ...

:: Check if repository exists
gh repo view %FULL_REPO_NAME% 2>&1 | findstr "could not find" >nul
if %errorlevel% equ 0 (
    :: Repository doesn't exist, create it
    if /i "%REPO_PUBLIC%"=="n" (
        gh repo create %REPO_NAME% --private --source=. --push --description "StayClose - Maintain Meaningful Connections"
    ) else (
        gh repo create %REPO_NAME% --public --source=. --push --description "StayClose - Maintain Meaningful Connections"
    )
    echo ✅ Repository created and code pushed!
) else (
    :: Repository exists, just push
    echo ⚠️  Repository already exists. Pushing to existing repo...
    git remote remove origin 2>nul
    git remote add origin https://github.com/%FULL_REPO_NAME%.git
    git branch -M main
    git push -u origin main
    echo ✅ Code pushed to existing repository!
)

set REPO_URL=https://github.com/%FULL_REPO_NAME%
echo.
echo 🔗 Repository URL: %REPO_URL%

:: Check Vercel CLI
echo.
echo 🚀 Deploying to Vercel

vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Vercel CLI not found. Installing...
    npm i -g vercel
)

:: Check Vercel authentication
vercel whoami 2>&1 | findstr "@" >nul
if %errorlevel% neq 0 (
    echo ⚠️  Vercel CLI not authenticated.
    echo Please run: vercel login
    echo.
    echo Your code is on GitHub at: %REPO_URL%
    echo You can deploy manually from the Vercel dashboard.
    exit /b 1
)

echo ✅ Vercel CLI is authenticated

:: Deploy to Vercel
echo.
echo Starting Vercel deployment...
echo.

if exist ".vercel" (
    vercel --prod
) else (
    vercel --prod --confirm
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║  ✅ DEPLOYMENT COMPLETE!                                   ║
echo ║                                                            ║
echo ║  📁 GitHub: %REPO_URL%
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📋 Next Steps:
echo    1. Visit your Vercel dashboard: https://vercel.com/dashboard
echo    2. Add environment variables:
echo       • NEXT_PUBLIC_CONVEX_URL
echo       • NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
echo       • CLERK_SECRET_KEY
echo       • ANTHROPIC_API_KEY (optional)
echo       • OPENAI_API_KEY (optional)
echo.
echo    3. Configure Clerk:
echo       • Go to https://dashboard.clerk.dev
echo       • Add your Vercel domain to 'Allowed Origins'
echo.
echo    Happy connecting! 🔗
echo.

pause
