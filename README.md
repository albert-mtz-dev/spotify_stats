# Spotify Mirror

A Next.js web app that displays your personal Spotify listening profile with top artists, tracks, genre breakdowns, and listening patterns.

## Features

- **Top Artists & Tracks** - View your most played across different time ranges (4 weeks, 6 months, all time)
- **Genre Breakdown** - Interactive chart showing your genre distribution
- **Listening Patterns** - Heatmap visualization of when you listen to music
- **Personal Badges** - Earn badges based on your listening habits

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Auth**: Auth.js with Spotify provider
- **Database**: PostgreSQL (Supabase) + Prisma
- **Charts**: Chart.js + react-chartjs-2

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account (free tier works)
- Spotify Developer account

### 1. Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Set the redirect URI to `http://localhost:3000/api/auth/callback/spotify`
4. Note your Client ID and Client Secret

### 2. Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Go to Project Settings → Database
3. Copy the connection strings (URI and Direct URL)

### 3. Configure Environment

```bash
cp .env.example .env
```

Fill in your credentials:

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
AUTH_SECRET=generate_with_openssl_rand_base64_32
DATABASE_URL=your_supabase_pooler_url
DIRECT_URL=your_supabase_direct_url
NEXTAUTH_URL=http://localhost:3000
```

### 4. Install & Run

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and connect with Spotify.

## Project Structure

```
app/
  layout.tsx              # Root layout
  page.tsx                # Landing page
  dashboard/
    layout.tsx            # Dashboard shell with sidebar
    page.tsx              # Main dashboard
    artists/page.tsx      # Full artists view
    tracks/page.tsx       # Full tracks view
  api/
    auth/[...nextauth]/   # Auth.js routes
    spotify/sync/         # Data sync endpoint
src/
  components/
    charts/               # GenreChart, ActivityHeatmap
    dashboard/            # Dashboard content components
    layout/               # Sidebar, Header
    motion/               # Animation presets
    ui/                   # StatCard, ArtistGrid, TrackList, etc.
  lib/
    analytics/            # Data aggregation utilities
    auth.ts               # Auth.js config
    prisma.ts             # Prisma client
    spotify.ts            # Spotify API helpers
    types.ts              # TypeScript types
```

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm test         # Run tests
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to DB
pnpm db:migrate   # Create migration
pnpm db:studio    # Open Prisma Studio
```

## License

MIT
