# Social Features Implementation Plan

This document outlines the implementation plan for adding social features to Spotify Mirror, allowing users to discover and view other users' public profiles.

## Overview

**Goal:** Allow users to look up other users and see their music stats.

**Key decisions:**
- Users are **public by default**, but clearly informed with option to go private
- Custom usernames are **optional** - Spotify display names are preferred
- A **search/discovery page** allows finding other users

---

## Phase 1: Database Schema Updates

**Changes to `prisma/schema.prisma`:**

```prisma
model User {
  // ... existing fields ...

  // Social fields
  username          String?   @unique  // optional custom handle
  bio               String?   @db.VarChar(160)  // short bio like Twitter
  profileVisibility ProfileVisibility @default(PUBLIC)
  lastSyncedAt      DateTime?

  // Index for search
  @@index([name])
  @@index([profileVisibility])
}

enum ProfileVisibility {
  PUBLIC
  PRIVATE
}
```

**Migration required** after schema change.

---

## Phase 2: API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/user/[identifier]` | GET | Fetch public profile by username OR user ID |
| `/api/user/settings` | GET/PATCH | Get/update current user's privacy settings |
| `/api/users/search` | GET | Search public users by name |
| `/api/user/claim-username` | POST | Claim a unique username |

### Key Logic

- `/api/user/[identifier]` returns 404 if user is private (unless viewing own profile)
- Search only indexes `PUBLIC` profiles
- Rate limit search endpoint to prevent abuse

---

## Phase 3: New Pages

```
app/
  u/
    [identifier]/
      page.tsx          -> Public profile view
  discover/
    page.tsx            -> Search & discovery page
  settings/
    page.tsx            -> User settings (privacy, username, bio)
```

---

## Phase 4: Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `PublicProfile` | `src/components/profile/PublicProfile.tsx` | Renders a user's public stats |
| `UserCard` | `src/components/ui/UserCard.tsx` | Compact user preview for search results |
| `UserSearch` | `src/components/discover/UserSearch.tsx` | Search input + results |
| `PrivacySettings` | `src/components/settings/PrivacySettings.tsx` | Toggle visibility, claim username |
| `ProfileVisibilityNotice` | `src/components/ui/ProfileVisibilityNotice.tsx` | Banner shown on first login |
| `ShareProfileButton` | `src/components/ui/ShareProfileButton.tsx` | Copy profile link |

---

## Phase 5: Public Profile Data Contract

### What a public profile shows (conservative start):

```ts
interface PublicProfileData {
  user: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    bio: string | null;
    lastSyncedAt: Date | null;
  };
  stats: {
    topArtists: Artist[];      // limit 5
    topTracks: Track[];        // limit 5
    topGenres: string[];       // limit 5
    badges: Badge[];           // all earned badges
  };
}
```

### NOT exposed publicly:
- Listening history timestamps
- Activity heatmap (hour/day patterns)
- Exact play counts
- Email address

---

## Phase 6: First-Login Experience

When a user logs in for the first time (or first time after this feature ships):

1. Show a modal/banner: **"Your profile is public by default"**
2. Explain what's visible to others
3. Quick toggle to go private immediately
4. Link to full settings page

Store a flag like `hasSeenVisibilityNotice` in the database to avoid showing again.

---

## Phase 7: Search & Discovery

### `/discover` page features:
- Search bar (searches by Spotify display name)
- "Recently joined" section (newest public profiles)
- Optional: "Featured profiles" (curated/random public users)

### Search implementation:
```sql
SELECT * FROM "User"
WHERE "profileVisibility" = 'PUBLIC'
AND "name" ILIKE '%query%'
LIMIT 20;
```

---

## Phase 8: Sidebar Updates

Add to sidebar navigation:
- **Discover** -> `/discover`
- **Settings** -> `/settings`

Add share button in header when user is on their dashboard.

---

## Implementation Order

| Step | Task | Dependencies |
|------|------|--------------|
| 1 | Schema migration (add social fields) | None |
| 2 | `/api/user/settings` endpoint | Schema |
| 3 | Settings page UI | Settings API |
| 4 | `/api/user/[identifier]` endpoint | Schema |
| 5 | Public profile page `/u/[identifier]` | Profile API |
| 6 | `/api/users/search` endpoint | Schema |
| 7 | Discover page `/discover` | Search API |
| 8 | First-login visibility notice | Settings API |
| 9 | Update sidebar navigation | Pages exist |
| 10 | Share profile button | Profile page |

---

## Potential Blockers & Solutions

### 1. Spotify display names aren't unique
Two users could both be named "Alex".

**Solution:** Search returns multiple results. Profiles are accessed by internal user ID or claimed username (if set).

### 2. Stale data on public profiles
Users only sync when they log in, so a viewed profile might be weeks old.

**Solution:** Display "Last updated X ago" prominently on public profiles. Users must log in to refresh their data.

### 3. No Spotify ID exposed directly
We use internal `user.id` (cuid) for profile URLs unless a username is claimed.

**Solution:** Profile URLs are `/u/{userId}` by default, or `/u/{username}` if claimed.

---

## Security Considerations

- Access tokens and refresh tokens are **never** exposed in public profile data
- Email addresses are **never** exposed publicly
- Rate limiting on search API to prevent scraping
- Users can go private at any time, immediately hiding their profile

---

## Future Enhancements (Out of Scope for v1)

- Friend/follow system
- `FRIENDS_ONLY` visibility option
- Compare stats between two users
- Activity feed showing friends' recent listens
- Profile customization (banner image, theme color)
