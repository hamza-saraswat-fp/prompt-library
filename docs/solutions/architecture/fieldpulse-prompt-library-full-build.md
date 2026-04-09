---
title: "FieldPulse Prompt Library — Full Build Documentation"
category: architecture
problem_type: full_system_build
components: [auth, database, admin, ui, supabase]
tags: [react, supabase, rls, magic-link, admin-dashboard, prompt-management]
date: 2026-04-09
status: complete
---

# FieldPulse Prompt Library — Full Build Documentation

## Overview

A cross-departmental AI prompt library for FieldPulse. Users browse, search, favorite, rate, and copy prompts. Admins manage all content through a dashboard. Built on React 19 + Supabase + Vite + Tailwind.

**Production URL:** `https://prompt-library-sepia-seven.vercel.app`
**Repo:** `github.com/hamza-saraswat-fp/prompt-library`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19.2.4 + TypeScript 5.9 |
| Build | Vite 8.0.1 |
| Routing | React Router DOM 7.13.2 |
| Styling | Tailwind CSS 4.2.2 + shadcn/ui |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Notifications | Sonner |
| Deployment | Vercel |

---

## Features Built (in order)

### 1. Search-First Landing Page
- Hero search bar replacing the old card grid as default view
- Bundle carousel (horizontal Netflix-style scroll)
- Recommended Prompts vertical feed with horizontal cards
- Old card grid accessible via "All Prompts" in sidebar
- Table view toggle preserved

### 2. Recently Used Section
- Tracks last 10 prompts user interacted with (opened drawer or copied)
- Horizontal chip carousel between bundles and feed
- Hidden when empty (first visit)

### 3. Thumbs Up/Down Rating System
- Per-user voting with toggle/switch behavior
- Net score display (+N / 0 / -N)
- "Top Rated" sort option in header dropdown
- Rating buttons on feed cards, drawer, and detail page

### 4. Platform SVG Logos + ChatGPT URL Pre-fill
- Replaced colored dots with actual ChatGPT/Claude/Gemini SVG icons
- ChatGPT: `?q=` URL parameter pre-fills prompt text
- Claude/Gemini: copy to clipboard + open app (no URL pre-fill support)

### 5. Supabase Magic Link Authentication
- Email-based magic link sign-in (no OAuth)
- Profile auto-creation on first login (display_name parsed from email)
- Session persistence via Supabase SDK
- User avatar menu in header with sign out
- AuthGuard gates entire app behind login

### 6. Hardcoded Data → Supabase Migration
- Created 5 tables: `use_case_groups`, `categories`, `tags`, `bundles`, `prompts`
- JSONB for array fields (departments, models, variables, tags, versionHistory, useCases, comments)
- `useSupabaseData` hook replaces all hardcoded data imports
- Seed script (`scripts/seed.ts`) populates 26 test prompts
- All components receive data via props from the hook

### 7. localStorage → Supabase Migration
- **Favorites**: JSONB array on `profiles` table
- **Ratings**: `user_ratings` junction table + `prompt_ratings_summary` view
- **Recently Used**: JSONB array on `profiles` table
- **Comments**: Normalized `comments` table with author joins
- **Prompt Submission**: Actually inserts to DB with `created_by`, `status`, `visibility`

### 8. Admin Dashboard
- Route-guarded at `/admin` (admin role only)
- **Prompts tab**: Table of ALL prompts, click to edit in sheet, create/delete
- **Submissions tab**: Queue of `pending_review` prompts, approve/reject with feedback
- **Tags & Categories tab**: CRUD for tags (add, toggle type, delete) and categories (add, inline rename, delete)
- **Bundles tab**: CRUD with sheet editor and prompt multi-select
- **Users tab**: Table of all profiles, role toggle (promote/demote), activity detail

### 9. Submission Queue & My Prompts
- Submissions enter as `status: 'pending_review'`
- Admin approve → published, reject → rejected with feedback
- Pending count badge on Admin sidebar button
- "My Prompts" page shows user's submissions with status badges and rejection feedback

---

## Database Schema

### Tables

| Table | PK Type | Key Columns |
|-------|---------|-------------|
| `use_case_groups` | text | name, icon, sort_order |
| `categories` | text | name, group_id FK |
| `tags` | text | type ('department' or 'workflow') |
| `bundles` | text | name, description, sort_order |
| `prompts` | text | title, prompt_text, category_id FK, bundle_id FK, created_by FK, status, visibility, rejection_feedback, + JSONB: departments, models, variables, tags, version_history, use_cases, comments |
| `profiles` | uuid | display_name, department, role, favorites (JSONB), recently_used (JSONB) |
| `user_ratings` | composite | user_id + prompt_id, vote ('up'/'down') |
| `comments` | uuid | prompt_id, user_id, text |

### Views

- `prompt_ratings_summary`: Aggregates `user_ratings` into `prompt_id, up_count, down_count, net_score`

### RLS Policies

- **Reference tables** (groups, categories, tags, bundles): SELECT for authenticated, mutations for admin via `is_admin()`
- **Prompts**: SELECT where `(published AND public) OR created_by = auth.uid() OR is_admin()`, INSERT for authenticated, UPDATE/DELETE for creator or admin
- **Profiles**: Users read/update own; admins read/update all via `is_admin()` (SECURITY DEFINER)
- **User ratings**: SELECT all (public for aggregation), INSERT/UPDATE/DELETE own
- **Comments**: SELECT all, INSERT own, DELETE by author or admin

---

## Key Architectural Decisions

### JSONB vs Junction Tables
- **JSONB chosen** for: tags, departments, models, variables, versionHistory, useCases on prompts; favorites and recently_used on profiles
- **Junction table chosen** for: user_ratings (need aggregation for Top Rated sort)
- **Normalized table chosen** for: comments (multi-user, need author joins, per-comment RLS)
- **Rationale**: Components consume arrays directly; no independent queries needed on individual tags/variables

### Text PKs vs UUIDs
- Text PKs for semantic entities (prompts, categories, groups, bundles, tags) — readable URLs, debuggable
- UUIDs for internal records (comments, user ratings) — no user-facing need

### Magic Link Auth (No Passwords)
- Avoids OAuth complexity (no Google Cloud setup)
- Supabase handles entire flow
- **Known limitation**: Free tier rate limits (~3-4 per hour per email)
- **Future**: Add password-based fallback

### Status Workflow
- `draft` → `pending_review` → `published` / `rejected`
- Constraint: `CHECK (status IN ('draft', 'pending_review', 'published', 'rejected'))`
- Rejection stores feedback in `rejection_feedback` column

### Tag Color System
- Tags with `type = 'department'` → blue badges
- Tags with `type = 'workflow'` → purple badges
- `createGetTagColor(departments)` factory function, initialized from Supabase data

---

## Problems Encountered & Solutions

### 1. RLS Recursion on Profiles Table
**Problem**: Admin policy checking `profiles.role = 'admin'` inside a policy ON `profiles` caused infinite recursion.
**Fix**: Use `is_admin()` function with `SECURITY DEFINER` — runs as function owner, bypasses RLS.

### 2. Supabase Join Returning Array
**Problem**: `comments` join to `profiles(display_name)` returned an array instead of single object.
**Fix**: Defensive type handling — `Array.isArray(comment.profiles) ? comment.profiles[0]?.display_name : comment.profiles?.display_name`

### 3. Feed Card Buttons Not Visible
**Problem**: Copy/rating buttons in feed cards clipped by parent overflow settings.
**Fix**: Restructured card layout — buttons placed inside the card flow rather than as a separate column.

### 4. Claude/Gemini URL Pre-fill
**Problem**: Only ChatGPT supports `?q=` URL parameter. Claude removed it (security), Gemini never had it.
**Fix**: Graceful degradation — copy to clipboard + open app for Claude/Gemini.

### 5. Magic Link Rate Limiting
**Problem**: Supabase free tier limits OTP emails to ~3-4 per hour per email.
**Fix**: Currently informational error display. Future: add password-based login fallback.

---

## Data Flow Architecture

```
App.tsx (main state hub)
├── useSupabaseData() → prompts[], groups[], bundles[], allTags[], departments[]
├── useFavorites() → profiles.favorites JSONB
├── useRatings() → user_ratings table + prompt_ratings_summary view
├── useRecentlyUsed() → profiles.recently_used JSONB
├── useAuth() → session, profile, signIn/signOut
│
├── Filtering: search → favorites → bundle → group/category → tags
├── Sorting: title (A-Z/Z-A) or rating (net score)
│
├── HomePage (hero + carousel + feed)
├── BrowsePage (card grid or table)
├── PromptPage (fetch by ID from Supabase)
├── AdminPage (own state, direct Supabase queries)
└── MyPrompts (user's submissions)
```

---

## File Structure

```
src/
├── App.tsx, main.tsx, vite-env.d.ts
├── contexts/AuthContext.tsx
├── hooks/ (useSupabaseData, useFavorites, useRatings, useRecentlyUsed, useTheme)
├── lib/ (supabase, tag-colors, variables, utils)
├── data/types.ts
├── pages/ (PromptPage, AdminPage)
├── components/
│   ├── layout/ (AppShell, Header, Sidebar)
│   ├── home/ (HomePage, HeroSearch, BundleCarousel, PromptFeed, PromptFeedCard, RecentlyUsedCarousel)
│   ├── prompts/ (PromptCard, PromptGrid, PromptTable, PromptDrawer, PromptDetailView, PromptBundle, CategoryPills, RatingButtons, CommentsSection, MyPrompts, AiPlatformButtons, UseCaseShowcase)
│   ├── admin/ (AdminPromptTable, AdminPromptEditor, AdminDeleteDialog, AdminSubmissionQueue, AdminSubmissionReview, AdminTagManager, AdminCategoryManager, AdminBundleManager, AdminUserManager)
│   ├── auth/ (LoginPage, AuthGuard, UserMenu)
│   ├── icons/ (PlatformIcons)
│   ├── vision/ (SubmitPrompt)
│   └── ui/ (shadcn components)
└── scripts/ (seed.ts, migration*.sql)
```

---

## Environment Variables

```
VITE_SUPABASE_URL=https://jvctrvmoaanzcjfgsldp.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key — seed script only>
```

Set in `.env.local` (gitignored) and Vercel project settings.

---

## Commit History

```
7e588f3 feat: admin user management view
b47abc6 feat: admin management views for tags, categories, and bundles
d88088b feat: admin dashboard, submission queue, and My Prompts
1e2d8d7 fix: handle Supabase profiles join returning array in CommentsSection
161fe07 feat: migrate localStorage features to Supabase
340cf98 fix: pass bundles prop to BrowsePage to resolve TypeScript build errors
c06ca5e feat: migrate hardcoded data to Supabase
62e8615 feat: add Supabase magic link authentication
0d3bfa4 feat: search-first landing page, recently used, ratings, platform logos
723db95 feat: v2 overhaul — tags, card view, routing, AI buttons, comments
```

---

## Future Work (Not Yet Built)

- **Password-based login** alongside magic link
- **Category reordering** (no sort_order column on categories yet)
- **Real-time updates** via Supabase Realtime
- **User preference syncing** (dark mode, view toggle to profiles table)
- **Drag-and-drop** for bundle prompt ordering
- **Full-text search** via PostgreSQL tsvector indexes
- **Pagination** if prompts exceed ~500
