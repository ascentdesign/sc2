# StayClose — Phase 1 Web App

A relationship maintenance web application that helps you stay connected with the people you care about. One friend per day, one reach-out at a time.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **Backend**: Convex (real-time database + API)
- **Auth**: Clerk
- **AI**: Anthropic Claude API
- **Runtime**: Bun
- **Package Manager**: Bun workspaces

## Project Structure

```
stayclose/
├── apps/
│   ├── web/              # Next.js web app
│   └── mobile/           # React Native (Phase 2)
├── packages/
│   ├── convex/           # Convex schema + functions
│   ├── ai/              # Claude API wrappers
│   ├── ui/              # Shared UI components
│   └── types/           # Shared TypeScript types
```

## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up environment variables:
   ```bash
   cd apps/web
   cp .env.local.example .env.local
   # Fill in your Convex, Clerk, and Anthropic API keys
   ```

3. Start Convex dev server:
   ```bash
   bun run convex:dev
   ```

4. Start the web app:
   ```bash
   bun run web
   ```

## Development

- Run all dev servers: `bun run dev`
- Build all packages: `bun run build`
- Run tests: `bun test`

## Features

- ✅ Daily friend recommendations based on overdue score
- ✅ Add/edit/archive friends with cadence settings
- ✅ Log interactions (call, text, voice notes)
- ✅ Snooze friends for later
- ✅ Mobile-first responsive design
- ✅ Real-time updates via Convex

## Roadmap

### Sprint 2 (Week 3-4)
- Voice note recording and transcription
- AI context snippet generation
- Post-action prompts

### Sprint 3 (Week 5-6)
- Photo upload
- Framer Motion animations
- ML feedback loop for cadence optimization

### Phase 2 (Mobile)
- React Native/Expo mobile app
- Push notifications
- iOS Home Screen widget

## License

Confidential — Corporate Intelligence
