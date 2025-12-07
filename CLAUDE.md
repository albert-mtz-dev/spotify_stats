# AGENTS.md — Spotify Mirror App

## 0. Project Overview

**Product:** “Spotify Mirror” — a Next.js web app that lets a user log in with Spotify and see a personal music profile:

- Top artists/tracks across time ranges  
- Genre breakdown  
- Approximate listening time / activity  
- Time-of-day & day-of-week listening patterns  
- Fun badges and summaries

**Primary stack (opinionated defaults):**

- **Framework:** Next.js (App Router) + TypeScript  
- **Styling:** Tailwind CSS  
- **Animations:** Framer Motion (`framer-motion` + `framer-motion/react`)  
- **Auth:** Auth.js / NextAuth with Spotify provider  
- **Data:** Postgres (or Supabase) + Prisma  
- **Charts:** Recharts or react-chartjs-2  
- **Deployment:** Vercel (or equivalent) with environment variables for secrets  

**Visual direction:**  
Mimic Spotify’s UI style:

- Dark gray/black background  
- Spotify-like green accents  
- Rounded cards, clean grids  
- Left sidebar + main content layout  
- Smooth micro-animations, not carnival-level chaos

---

## 1. Global Constraints & Principles

All agents must respect these:

1. **Security**
   - No hardcoded secrets or tokens.
   - Use `process.env.*` for Spotify credentials and DB connection.
   - Raw access tokens stay server-side and are never sent to the client.

2. **Spotify API scope**
   - Use minimal necessary scopes:
     - `user-top-read`
     - `user-read-recently-played`
     - `user-read-email`, `user-read-private` (optional).
   - Prefer caching & summarizing in our DB vs. hitting Spotify on every render.

3. **Separation of concerns**
   - Auth & token handling: server-side only.
   - Data sync/aggregation: server routes/background jobs.
   - UI consumes summarized data models, not raw API responses.

4. **Performance & UX**
   - Prefer React Server Components for data fetching where appropriate.
   - Use skeletons/loading states; avoid blank flashes.
   - Mobile-first layout; dashboard must be usable and readable on small screens.

5. **Code quality**
   - Use TypeScript across the codebase.
   - Keep functions small and cohesive.
   - Basic test coverage for core logic (token refresh, aggregations, badge rules).

6. **Design consistency**
   - Single source of truth for tokens via Tailwind config + CSS variables.
   - No random hex colors in components; use theme variables or Tailwind tokens.
   - Dark theme only for v1.

7. **Animation principles (Framer Motion)**
   - Animations must be:
     - Subtle
     - Purposeful (communicate state, hierarchy, focus)
     - Consistent
   - No long or blocking animations; keep transitions snappy (~150–250ms).
   - Prefer motion presets/utilities rather than ad-hoc configs everywhere.

---

## 2. Shared Conventions

### 2.1 Project structure (App Router)

```text
app/
  layout.tsx
  page.tsx                 // landing page
  dashboard/
    page.tsx               // main user dashboard (protected)
  api/
    auth/[...nextauth]/route.ts   // Auth.js
    spotify/
      sync/route.ts        // triggers sync from Spotify → DB
      dashboard/route.ts   // summarized dashboard data (optional)
prisma/
  schema.prisma
src/
  lib/
    spotify.ts             // low-level Spotify client + helpers
    auth.ts                // session + token helpers
    analytics/             // aggregation functions
    types.ts               // shared types for API <-> UI
  components/
    layout/
    ui/
    charts/
    motion/                // reusable motion wrappers & variants
styles/
  globals.css
  theme.css                // CSS variables for dark theme
tailwind.config.cjs/ts
```

### 2.2 Design system (Spotify-inspired)

**Color tokens (approximate):**

- `--color-bg-main`: `#121212`
- `--color-bg-elevated`: `#181818`
- `--color-bg-highlight`: `#1f2933`
- `--color-accent`: `#1DB954`
- `--color-accent-soft`: `#1ed760`
- `--color-text-primary`: `#ffffff`
- `--color-text-secondary`: `#b3b3b3`
- `--color-border-subtle`: `#282828`

**Typography:**

- Font stack:

  ```css
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  ```

- Titles:
  - Page title: `text-3xl` or `text-2xl`, `font-bold`
  - Section headers: `text-xl`, `font-semibold`
  - Body: `text-sm`–`text-base`

**Shape & components:**

- Cards: `rounded-xl`–`rounded-2xl`, `border border-[var(--color-border-subtle)]`
- Buttons:
  - Primary: green, pill-shaped (`rounded-full`).
  - Secondary: outlined or subtle background.

### 2.3 Git Commit Conventions

Follow **Conventional Commits** format for all commits:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Commit Types:**

| Type | Description |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `style` | Formatting, missing semicolons, etc. (no code change) |
| `docs` | Documentation only changes |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, or tooling changes |
| `perf` | Performance improvements |
| `ui` | UI/UX changes (styling, layout, animations) |

**Scopes (optional but recommended):**

- `auth` — Authentication & session management
- `api` — API routes and backend logic
- `dashboard` — Dashboard page and components
- `charts` — Chart components and visualizations
- `sync` — Spotify data sync functionality
- `db` — Database schema and queries
- `ui` — General UI components
- `motion` — Animations and transitions

**Examples:**

```bash
feat(charts): add cumulative listening chart component

fix(auth): handle token refresh edge case when session expires

refactor(api): extract sync logic into separate utility

ui(dashboard): improve stat card hover animations

chore(deps): update framer-motion to v11
```

**Commit Message Rules:**

1. Use imperative mood: "add feature" not "added feature"
2. Keep subject line under 72 characters
3. Capitalize the subject line
4. No period at the end of the subject line
5. Separate subject from body with a blank line
6. Use body to explain *what* and *why*, not *how*

### 2.4 Code Comment Conventions

**When to Comment:**

- Complex business logic that isn't self-evident
- Workarounds or hacks with context on *why*
- API quirks or Spotify-specific behaviors
- Performance-critical sections
- TODO items with context

**When NOT to Comment:**

- Obvious code (e.g., `// increment counter` before `count++`)
- Code that can be made self-documenting via better naming
- Commented-out code (delete it; use git history)

**Comment Formats:**

```ts
// Single-line comment for brief explanations

/**
 * Multi-line JSDoc for functions, components, and types.
 * Include @param and @returns for public APIs.
 */

// TODO: <description> — for planned improvements
// HACK: <description> — for temporary workarounds (include why)
// NOTE: <description> — for important context
```

**Examples:**

```ts
// Spotify returns genres on artists, not tracks — aggregate from top artists
const genres = aggregateGenresFromArtists(artists);

/**
 * Normalizes tempo to 0-100 scale for radar chart display.
 * Assumes typical BPM range of 60-180.
 */
function normalizeTempo(bpm: number): number {
  return Math.min(100, Math.max(0, ((bpm - 60) / 120) * 100));
}

// HACK: Force re-render after hydration to fix chart sizing issue
// See: https://github.com/chartjs/react-chartjs-2/issues/XXX
useEffect(() => { ... }, []);

// TODO: Add retry logic for rate-limited Spotify API calls
```

**Component Documentation:**

For complex components, add a brief header comment:

```tsx
/**
 * CumulativeListeningChart
 *
 * Displays cumulative plays over time (hourly or daily).
 * Shows running total with percentage tooltip.
 *
 * @prop patterns - Array of ListeningPattern from analytics
 * @prop mode - "hourly" (24h) or "daily" (7 days)
 */
export function CumulativeListeningChart({ patterns, mode = "hourly" }: Props) {
```

---

## 3. Motion / Animation Guidelines

All UI-related agents must use **Framer Motion** with consistent patterns.

### 3.1 Motion primitives

Create shared motion utilities:

```ts
// src/components/motion/presets.ts
import { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleOnHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.03 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};
```

Use these consistently rather than inventing new variants in every component.

### 3.2 Where to use motion

- **Page transitions**
  - `app/page.tsx` and `app/dashboard/page.tsx` can wrap main content in `motion.main` with a simple fade/slide:

    ```tsx
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      ...
    </motion.main>
    ```

- **Section entrances**
  - Each dashboard section (Top Artists, Top Tracks, Genres, Activity, Badges) should animate in on mount using `fadeInUp` and `staggerContainer`.

- **Hover interactions**
  - Cards (artists, badges) use gentle scale + shadow change on hover.
  - Buttons use subtle scale or background-color interpolation.
  - Track rows use background color fade on hover (Tailwind + minimal motion if needed).

- **Charts & visualizations**
  - When possible, animate data appearing (e.g., fade in the chart container, then let the chart library handle internal transitions).

### 3.3 What NOT to do

- No infinite, distracting animations (e.g., bouncing forever).
- No long entrance animations that delay user interaction.
- No radically different animation styles per section — keep it cohesive.

---

## 4. Agent Roles

### 4.1 Product & UX Agent

**Goal:** Define flows and screen structure, tuned to a Spotify-style dark UI with subtle motion.

**Responsibilities:**

- Define:
  - Landing → Connect with Spotify → `/dashboard`.
  - First-time sync experience.
  - “Refresh data” UX (e.g., button or subtle icon in header).

- Layout:

  - **Global shell:**
    - Left sidebar (Spotify-style) with nav items:
      - Overview
      - Artists
      - Tracks
      - Insights (future)
    - Main content area with:
      - Sticky/top bar showing user info and maybe a blurred gradient.

  - **Dashboard content:**
    - Top: title + summary text.
    - Stats row: listening time, total tracks, unique artists.
    - Sections:
      - Top artists grid
      - Top tracks list
      - Genre breakdown
      - Listening patterns (heatmap)
      - Badges & insights

- Motion in UX spec:
  - Indicate which elements appear with staggered motion.
  - Define hover vs. tap vs. focus states.

**Artifacts:**

- `docs/ux-flows.md`
- `docs/ux-motion-notes.md` (where motion adds clarity)

---

### 4.2 Auth & Spotify Integration Agent

**Goal:** Implement secure Spotify OAuth + token management.

**Responsibilities:**

- Configure Auth.js / NextAuth with Spotify provider and required scopes.
- Implement access + refresh token storage and refresh logic.
- Provide `spotifyFetch(userId, path, init?)` helper that:
  - Looks up tokens
  - Refreshes if necessary
  - Calls Spotify API

- No direct motion here; this agent just exposes async utilities used by others.

**Artifacts:**

- `app/api/auth/[...nextauth]/route.ts`
- `src/lib/auth.ts`
- `src/lib/spotify.ts`
- `docs/auth-spotify.md`

---

### 4.3 Data & Analytics Agent

**Goal:** Turn Spotify data into summaries the UI can use.

**Responsibilities:**

- Prisma schema for:
  - `User`
  - `SpotifySnapshot`
  - `ListeningActivity`
  - `GenreStats`

- Aggregation utilities:
  - `computeTopArtistsSummary`
  - `computeTopTracksSummary`
  - `bucketPlaysByHourAndWeekday`
  - `aggregateGenresFromArtists`
  - `assignBadges`

- Provide types in `src/lib/types.ts` that are used by UI + API.

**Artifacts:**

- `prisma/schema.prisma`
- `src/lib/analytics/*.ts`
- `src/lib/types.ts`
- `docs/analytics-model.md`

---

### 4.4 Backend API & Sync Agent

**Goal:** Sync from Spotify and serve summarized data.

**Responsibilities:**

- Implement `/api/spotify/sync`:
  - Authenticated user only.
  - Fetch top artists/tracks, recently played.
  - Run analytics, store in DB.

- Implement dashboard data loading:
  - Preferred: server-side load in `dashboard/page.tsx`.
  - Optional: `/api/spotify/dashboard` returning one payload.

- No direct motion here; this agent defines the contract for Frontend & UI.

**Artifacts:**

- `app/api/spotify/sync/route.ts`
- `app/api/spotify/dashboard/route.ts` (if used)
- `docs/api-contract.md`

---

### 4.5 Frontend & UI Agent

**Goal:** Build Spotify-like UI with Tailwind + Framer Motion.

**Responsibilities:**

- **Global layout (`app/layout.tsx`):**

  - Dark theme body:

    ```tsx
    <html lang="en">
      <body className="bg-[var(--color-bg-main)] text-[var(--color-text-primary)] antialiased">
        {/* Providers, layout shell */}
      </body>
    </html>
    ```

  - Layout shell component with:
    - `Sidebar` on the left.
    - `motion.main` content area.

- **Motion utilities:**

  - Implement `src/components/motion/presets.ts` (shared variants).
  - Optional higher-order wrapper like `MotionSection`:

    ```tsx
    import { motion } from "framer-motion";
    import { fadeInUp } from "../motion/presets";

    export function MotionSection(props: React.HTMLAttributes<HTMLDivElement>) {
      return (
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.2, ease: "easeOut" }}
          {...props}
        />
      );
    }
    ```

- **Landing page (`app/page.tsx`):**

  - Hero area with:
    - `motion.div` to fade in text.
    - Green CTA button using Tailwind.
  - Optional subtle animated background gradient.

- **Sidebar (`src/components/layout/Sidebar.tsx`):**

  - Tailwind for layout:
    - `w-56 bg-[var(--color-bg-elevated)] border-r border-[var(--color-border-subtle)]`
  - Motion:
    - Could be static, but nav items can use hover/tap interactions.

- **Dashboard (`app/dashboard/page.tsx`):**

  - Load data server-side, then pass to client as needed.
  - Use `motion.main` with a basic page entrance.
  - Each content block a card with:

    ```tsx
    <motion.div
      className="bg-[var(--color-bg-elevated)] rounded-xl border border-[var(--color-border-subtle)] p-4"
      variants={fadeInUp}
    >
      ...
    </motion.div>
    ```

  - **Top artists grid:**
    - Cards using scale-on-hover:

      ```tsx
      <motion.div
        variants={scaleOnHover}
        initial="rest"
        whileHover="hover"
        className="rounded-xl bg-[var(--color-bg-highlight)] p-3 cursor-pointer"
      >
        {/* artist content */}
      </motion.div>
      ```

  - **Top tracks list:**
    - Table/list with `hover:bg-[var(--color-bg-highlight)] transition-colors`.

  - **Charts (genres, activity):**
    - Wrap chart container in `motion.div` with `fadeIn`.
    - Let chart lib handle internal animations where possible.

  - **Badges:**
    - Badge pills with a gentle pop-in (staggered).

**Artifacts:**

- `app/layout.tsx`
- `app/page.tsx`
- `app/dashboard/page.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/ui/*` (StatCard, ArtistGrid, TrackList, BadgePill, etc.)
- `src/components/motion/presets.ts`
- `styles/theme.css`

---

### 4.6 Testing & QA Agent

**Goal:** Make sure it works and doesn’t break.

**Responsibilities:**

- Unit tests:
  - Token refresh
  - Analytics
  - Badge logic

- UI sanity:
  - Ensure motion doesn’t cause layout jank.
  - Confirm that in reduced motion environments (if you hook into it later), animations degrade gracefully (future enhancement; v1 doesn’t need full support but avoid doing anything impossible to turn down later).

- Manual checks:
  - Dark theme readability.
  - Responsive layout.
  - No white flashes on navigation.

**Artifacts:**

- `tests/*`
- `docs/testing-notes.md`

---

## 5. Phased Build Plan

1. **Phase 1: Setup**
   - Tailwind + theme variables.
   - Framer Motion installed + motion presets.
   - Auth.js basic login working.

2. **Phase 2: Data & Sync**
   - Prisma schema + migrations.
   - Spotify sync route + analytics utilities.

3. **Phase 3: UI Shell**
   - Layout, Sidebar, Landing page with Tailwind + motion.
   - `/dashboard` skeleton with animated sections (no real data yet).

4. **Phase 4: Data Integration**
   - Wire real dashboard data.
   - Top artists, tracks, basic stats.

5. **Phase 5: Enhancements**
   - Genres, activity heatmap, badges.
   - Polish motion (staggering, nicer hover states).

6. **Phase 6: Hardening**
   - Tests & QA.
   - Fix edge cases (no data, token expired, partial sync).

---

## 6. Definition of “Done” (v1)

- Spotify login works.
- Dashboard shows:
  - User name + avatar.
  - Top artists & tracks.
  - Listening time summary.
  - Genre breakdown.
  - At least a couple badges.
- UI:
  - Dark Spotify-like shell using Tailwind.
  - Subtle Framer Motion animations on:
    - Page load
    - Section entrances
    - Card hovers
- No secrets in code, tests passing.
