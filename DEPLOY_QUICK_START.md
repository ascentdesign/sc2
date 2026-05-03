# StayClose - Quick Deploy to Vercel

> ⚡ One-command deployment using GitHub CLI

## Prerequisites

Install these tools first:
- [Git](https://git-scm.com/)
- [GitHub CLI](https://cli.github.com/)
- [Node.js](https://nodejs.org/) (with npm)
- [Vercel CLI](https://vercel.com/download) (optional, will be installed if missing)

## 🚀 One-Command Deploy

### macOS/Linux

```bash
./scripts/setup-and-deploy.sh
```

### Windows

```batch
scripts\setup-and-deploy.bat
```

Or double-click `scripts\setup-and-deploy.bat`

---

## 📋 Manual Steps (if automatic fails)

### Step 1: Login to GitHub CLI

```bash
gh auth login
```

Choose:
- **HTTPS** or **SSH**
- Login with **web browser**

### Step 2: Login to Vercel CLI

```bash
vercel login
```

### Step 3: Run the Script

```bash
./scripts/setup-and-deploy.sh
```

---

## 🔧 What the Script Does

1. ✅ Checks all required tools are installed
2. ✅ Verifies GitHub/Vercel authentication
3. ✅ Creates a new GitHub repository
4. ✅ Pushes code to GitHub
5. ✅ Deploys to Vercel
6. ✅ Shows deployment URL

---

## 📝 After Deployment

Visit your Vercel dashboard:
```
https://vercel.com/dashboard
```

Add these environment variables:

| Variable | Get from |
|----------|----------|
| `NEXT_PUBLIC_CONVEX_URL` | [Convex Dashboard](https://dashboard.convex.dev) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [Clerk Dashboard](https://dashboard.clerk.dev) |
| `CLERK_SECRET_KEY` | [Clerk Dashboard](https://dashboard.clerk.dev) |
| `ANTHROPIC_API_KEY` | [Anthropic](https://console.anthropic.com) |
| `OPENAI_API_KEY` | [OpenAI](https://platform.openai.com) |

---

## 🎉 You're Done!

Your app will be live at:
```
https://your-project.vercel.app
```

---

## ❓ Troubleshooting

### "GitHub CLI not authenticated"
Run: `gh auth login`

### "Vercel CLI not authenticated"
Run: `vercel login`

### "Repository already exists"
The script will push to the existing repo.

### More help
See `DEPLOY.md` for detailed instructions.
