# Deploy StayClose to Vercel

> ⚠️ **Prerequisites**: You need accounts on:
> - [Vercel](https://vercel.com)
> - [Convex](https://convex.dev)
> - [Clerk](https://clerk.dev)
> - [Anthropic](https://anthropic.com) (optional, for AI)
> - [OpenAI](https://openai.com) (optional, for transcription)

## Option 1: Using Vercel CLI (Recommended)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link Your Project
```bash
cd stayclose
vercel
```

Follow the prompts to link your project.

### Step 4: Set Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Secret |
|----------|-------|--------|
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL | No |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key | No |
| `CLERK_SECRET_KEY` | Your Clerk secret key | Yes |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes |
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |

### Step 5: Deploy
```bash
vercel --prod
```

## Option 2: Using Git Integration

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install --legacy-peer-deps`

### Step 3: Add Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_CONVEX_URL=https://your-convex-project.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
```

## Option 3: Using This Repository

Since this is an AI-generated project, you'll need to:

1. **Create a new repository** on GitHub

2. **Copy all files** from this project:
   ```bash
   # From your local copy
   cp -r stayclose/* your-new-repo/
   cd your-new-repo
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Follow Option 2** above to deploy from GitHub

## Post-Deployment Checklist

After deployment, make sure to:

- [ ] **Configure Clerk** production settings at [dashboard.clerk.dev](https://dashboard.clerk.dev)
  - Add your Vercel domain to "Allowed Origins"
  - Configure webhook endpoint

- [ ] **Configure Convex** at [dashboard.convex.dev](https://dashboard.convex.dev)
  - Deploy Convex functions: `npx convex deploy`
  - Set up production environment variables

- [ ] **Test PWA** by adding to home screen on mobile

- [ ] **Verify Analytics** are working

- [ ] **Test all features**: sign-up, add friend, daily card, snooze, etc.

## Troubleshooting

### Build Errors

**Error: Cannot find module '@stayclose/convex'**
- Make sure packages are built: `npm run build` from root
- Or use workspace references: `npm install --legacy-peer-deps` in apps/web

**Error: Convex URL not found**
- Set `NEXT_PUBLIC_CONVEX_URL` environment variable
- Make sure Convex is deployed: `npx convex deploy`

**Error: Clerk authentication fails**
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- Add your Vercel domain to Clerk's allowed origins

### Performance Issues

- Enable Vercel Analytics
- Enable Convex caching for expensive queries
- Use Next.js Image component for photos

## 🎉 You're Live!

Your StayClose app is now deployed and accessible at your Vercel domain!

Visit your deployed URL and test:
1. Sign up with Clerk
2. Add a friend
3. Check the Today screen
4. Snooze a friend
5. Log an interaction

**Questions?** Check `PROJECT_COMPLETE.md` for full documentation.
