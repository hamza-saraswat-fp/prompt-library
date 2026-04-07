# FieldPulse Prompt Library — Master Plan: Prototype → Production

**Date:** 2026-04-02
**Authors:** Hamza Saraswat, Evan Rallis
**Status:** Pre-Development Planning
**Stack:** React + Vite + Tailwind → Vercel (hosting) + Supabase (backend)

---

## 1. Backend & Infrastructure

The prompt library today is a static frontend prototype with hardcoded data. To make it functional, we need a backend for persistence, authentication, and analytics. Supabase is the chosen platform — it gives us a Postgres database, auth, real-time subscriptions, and a JavaScript SDK with no separate API server required.

### 1.1 Hosting & Deployment

**Vercel** for frontend hosting. The React app is already Vite-based, which Vercel handles natively. Environment variables for Supabase (URL, anon key) are configured in Vercel's dashboard. Deployments trigger automatically on push to `main`.

### 1.2 Authentication

**Google OAuth via Supabase Auth.** Simple "Sign in with Google" button — zero passwords to manage. This is the lowest-friction option for an internal tool. Supabase handles the OAuth flow, session management, and token refresh. If Google accounts aren't universally available, email magic links are the fallback.

### 1.3 User Roles & Permissions

Three roles, enforced via Supabase Row Level Security (RLS):

| Role | Capabilities |
|---|---|
| **User** | Browse, search, copy, favorite, comment, rate prompts, submit prompts (pending approval), create personal collections |
| **Admin** | All user perms + approve/reject prompt submissions, create/manage bundles, manage tags, view analytics dashboard, manage user roles |

A `profiles` table extends Supabase's `auth.users` with `role`, `display_name`, and `department`. RLS policies on every table check the user's role before allowing writes.

### 1.4 Database (High-Level)

All data lives in Supabase Postgres. Here are the core tables and what they store:

**Core Content**
- **`prompts`** — The heart of the library. Stores title, overview, prompt text, category, author, version, trending flag, timestamps. Each prompt is a row.
- **`tags`** — Admin-managed tag list with a `type` field ("department" or "workflow") that drives the blue/purple color coding in the UI.
- **`prompt_tags`** — Many-to-many join between prompts and tags. A prompt can have multiple tags.
- **`variables`** — Template variables for each prompt (name, description, sort order). Stored separately so they're structured, not just parsed from text.
- **`categories`** — The use-case categories (Outreach, Onboarding, etc.) that organize prompts in the sidebar.

**Bundles & Collections**
- **`bundles`** — Admin-curated groups of related prompts (e.g., "New Customer Onboarding"). Has a name and description.
- **`bundle_prompts`** — Join table linking bundles to prompts with sort order.
- **`collections`** — User-created personal "playlists" of prompts. Like bundles but owned by individual users and shareable.
- **`collection_prompts`** — Join table linking collections to prompts.

**User Engagement**
- **`comments`** — Text feedback on prompts. Linked to author and prompt. Timestamped.
- **`favorites`** — User-prompt pairs for the favorites feature.
- **`ratings`** — Per-user effectiveness ratings on prompts ("worked great", "needed tweaking", "didn't help"). Drives quality signals.

**History & Analytics**
- **`version_history`** — Snapshot of each prompt version with the full prompt text at that point, change description, and author. Powers the version timeline and future diff view.
- **`prompt_analytics`** — Event log tracking copies, views, and which AI platform was used. Powers the analytics dashboard and "trending" calculations.
- **`prompt_embeddings`** — Vector embeddings of prompt content for semantic search (pgvector). Generated on prompt create/update.

**Users**
- **`profiles`** — Extends Supabase `auth.users` with display name, role, and department. Created automatically on first login via a database trigger.

### 1.5 API Approach

No custom API server. The React app talks directly to Supabase using the `@supabase/supabase-js` SDK. This handles:
- Auth (login, logout, session refresh)
- CRUD (prompts, comments, tags, bundles, collections)
- Real-time subscriptions (live comment updates, new prompt notifications)
- Storage (if we ever need file uploads)
- Edge Functions (for anything that needs server-side logic — e.g., generating embeddings, AI-powered features)

---

## 2. AI Platform Integration

The "Open in ChatGPT / Claude / Gemini" buttons currently copy to clipboard and open the homepage. We want to make them actually pre-fill the prompt in each platform.

### 2.1 URL Patterns

| Platform | URL Pattern | Status |
|---|---|---|
| **ChatGPT** | `https://chatgpt.com/?q={encoded_prompt}` | Works — prefills the prompt in the input box |
| **Claude** | `https://claude.ai/new?q={encoded_prompt}` | Previously available, may have been removed for security reasons. Fallback: copy + open `claude.ai/new` |
| **Gemini** | `https://gemini.google.com/app?q={encoded_prompt}` | No reliable native support. Fallback: copy + open |

**How it works:** The prompt text (with variables filled in) is URL-encoded and appended as a query parameter. All three platforms always copy to clipboard first as a safety net — if the URL param doesn't work, the user can just paste.

### 2.2 Real Platform Logos

Replace the current colored dots with actual platform SVG icons:
- **ChatGPT** — OpenAI/ChatGPT icon (green)
- **Claude** — Anthropic/Claude icon (orange/coral)
- **Gemini** — Google Gemini sparkle icon (blue)

Simple monochrome SVGs stored in `public/` and rendered inline. Should support dark mode (use `currentColor` or `dark:invert`).

### 2.3 Mintlify Reference

Mintlify's docs platform has a "contextual menu" that lets users click "Open in ChatGPT" / "Open in Claude" — it creates a conversation with the page content as context. Their exact URL patterns are proprietary, but the UX pattern is the same: **copy content + open platform with content pre-loaded when possible**. We're replicating this pattern for prompts instead of docs pages.

---

# Proposed Features & Improvements

The following sections outline proposed enhancements to the Prompt Library — covering search, content management, user experience, and admin tooling. These are Hamza's recommendations based on the prototype feedback and product direction.

---

## 3. Search & Discovery

### 3.1 AI-Powered Semantic Search

**Current:** Simple text search matching on title, overview, prompt text, and tags.

**Proposed:** Use Supabase's **pgvector** extension for semantic search. When a prompt is created or updated, generate an embedding (using OpenAI `text-embedding-3-small` or similar) and store it in the `prompt_embeddings` table. When a user searches, embed their query and find the nearest prompts by cosine similarity.

This means a search like *"I need help writing a follow-up email after a customer demo"* finds the "Follow-Up Email After Demo" prompt even if the exact words don't match. It understands intent, not just keywords.

Can also power a **"Describe your problem" search mode** — a dedicated input where users describe what they're trying to accomplish in plain language, and the system recommends matching prompts.

### 3.2 AI-Generated Bundle Recommendations

Build on semantic search and analytics data:
- When a user views a prompt, show "Users who used this also used..." based on co-usage patterns from the analytics table
- AI-generated workflow suggestions: "Based on your search, here's a recommended workflow" grouping 2-3 related prompts into an on-the-fly bundle
- Implementation: lightweight LLM call or pgvector nearest-neighbor lookups — start simple, get smarter over time

### 3.3 Related Prompts ("You might also need...")

On each prompt's detail page, show 2-3 related prompts. Can start simple with tag overlap (prompts sharing the most tags) and evolve to pgvector similarity scoring. Low effort, high discovery value.

### 3.4 Guided Prompt Builder (Wizard)

For employees who don't know what prompt to use — a step-by-step wizard:
1. "What are you trying to do?" (dropdown: write an email, analyze data, create a document, troubleshoot, etc.)
2. "Who's the audience?" (customer, internal team, prospect, etc.)
3. "What tone?" (formal, conversational, technical, etc.)

Based on answers, the wizard either:
- Suggests matching existing prompts from the library
- Generates a new prompt on the fly using an LLM (via Supabase Edge Function)

This lowers the barrier for the ~200 employees with varying AI literacy. Power users skip it and go straight to search.

---

## 4. Prompts & Content Management

### 4.1 Prompt Submission & Review Workflow

**Current:** "Submit Prompt" button shows a toast but doesn't persist.

**Proposed:** A real submission pipeline:
- Any authenticated user can submit a prompt via a structured form (title, prompt text, variables, tags, category)
- Submitted prompts enter a **review queue** with status flow: `draft` → `in_review` → `approved` (or `rejected` with feedback)
- Admins get notified of new submissions (in-app notification, optional email)
- Reviewers can leave inline comments on drafts before approving
- On approval, the prompt goes live in the library
- Version history tracked automatically on each edit — every save creates a new version snapshot

### 4.2 Collapsible Bundles

**Current:** Bundles render as a dashed-border group of cards in card view.

**Proposed:** Make bundles a first-class navigation and UI element:
- In card view: a compact "Bundle" chip with the bundle name and prompt count. Clicking it **expands accordion-style** to reveal the prompts inside. When collapsed, shows name + count + brief description.
- Individual prompts within a bundle still appear independently in search, categories, and tag filters
- Sidebar gets a "Bundles" section for browsing all bundles
- Each bundle has its own detail page (`/bundles/:id`) showing all prompts, a description of the workflow, and the recommended order of use
- Admins can create, edit, and reorder bundles

### 4.3 User-Created Collections

Like playlists for prompts — a personal curation feature:
- Any user can create a collection (e.g., "My QBR Prep Kit", "Onboarding Toolkit")
- Add/remove prompts from any prompt's card or detail view
- Collections are private by default, but can be shared via a link (`/collections/:id`)
- Shared collections show the creator's name and are read-only for others (they can copy it to make their own)
- Different from bundles: bundles are admin-curated and represent official workflows; collections are personal and informal

### 4.4 Prompt Versioning & Diff View

**Current:** Version history shows a timeline with text descriptions of changes.

**Proposed:** Add a **diff view** when clicking any version entry — shows highlighted additions (green) and removals (red) in the prompt text. Useful for admins reviewing changes and power users who want to understand how a prompt evolved over time. Uses a simple string diff algorithm (no external dependencies needed).

---

## 5. User Experience Improvements

### 5.1 Prompt Effectiveness Tracking

After using a prompt, users can return and rate its effectiveness:
- Three options: **"Worked great"** / **"Needed tweaking"** / **"Didn't help"**
- Aggregated effectiveness score displayed on the prompt card and detail view (e.g., "87% effective — 23 ratings")
- More actionable than star ratings — captures actual usage outcomes
- Data feeds into sorting/filtering ("Most effective" sort option) and surfaces the highest-quality prompts organically

### 5.2 "Prompt of the Week" / Featured Prompts

A featured prompt banner at the top of the library:
- Admin manually picks a prompt OR it's auto-selected based on trending/effectiveness data
- Highlighted with a banner card at the top of the browse view
- Rotates weekly (or on-demand by admin)
- Drives discovery of underused prompts and keeps the library feeling alive and curated
- Low development effort, high engagement impact

### 5.3 Recently Used / Quick Access

A "Recent" section showing the last 5-10 prompts a user interacted with (copied, viewed detail, opened in AI platform):
- Appears at the top of the browse view (above the main grid/table)
- Horizontal scroll row of compact prompt chips or mini-cards
- Tracked via the `prompt_analytics` table — just a filtered query per user
- Reduces friction for repeat users who come back to the same prompts daily

### 5.4 Copy Button Back on Prompt Cards

Now that cards show enough context (overview, tags, author), the split copy button should return to the card footer. Users can evaluate a prompt from the card and copy it without opening the drawer. The card click still opens the drawer for full details. The copy button uses `e.stopPropagation()` to prevent triggering the card click.

### 5.5 "My Prompts" Personal Dashboard

For users who contribute to the library:
- Prompts they've authored (published + drafts)
- Prompts they've commented on or rated
- Their personal collections
- Copy/view analytics for their own prompts (how many people are using what they wrote)
- Accessible from the sidebar or user avatar menu

### 5.6 Prompt Ratings

A simple rating mechanism alongside effectiveness tracking:
- Thumbs up / thumbs down per prompt (one vote per user)
- Net score displayed on cards (e.g., "+12")
- Sortable and filterable by rating
- Lightweight — doesn't require the user to have actually used the prompt (unlike effectiveness tracking)

### 5.7 Analytics Dashboard (Admin)

A dedicated admin view surfacing:
- **Most copied prompts** — by total copies and by time period (this week, this month)
- **Most viewed prompts** — which prompts get the most attention
- **Platform preference** — ChatGPT vs Claude vs Gemini usage split
- **Search gaps** — queries that returned no results (identifies content opportunities)
- **Active users** — engagement metrics, DAU/WAU
- **Per-department breakdown** — which teams use the library most
- **Effectiveness leaderboard** — highest-rated prompts by actual usage outcomes

### 5.8 Keyboard Shortcuts

Power user feature for daily library users:
- `/` — Focus search
- `Esc` — Close drawer, modal, or dropdown
- `c` — Copy the focused/selected prompt
- `↑` `↓` — Navigate between prompts in table/card view
- `Enter` — Open the focused prompt's detail view

---

## 6. Admin Dashboard & Management View

Admins need a dedicated area to manage the library, review submissions, and understand usage. This is a separate view (accessible from the sidebar or user menu) — not mixed into the regular browse experience.

### 6.1 Prompt Management

The core admin workspace:
- **Submission queue** — List of prompts submitted by users awaiting approval. Each shows title, author, submitted date, and tags. Admins can preview the full prompt, leave feedback comments, and approve or reject with one click.
- **All prompts table** — Editable list of every prompt in the library. Admins can edit title, text, tags, category, and variables inline or in a detail editor. Supports bulk actions (archive, re-tag, change category).
- **Create prompt** — Full prompt editor for admins to author prompts directly (bypasses the submission queue).

### 6.2 Bundle & Tag Management

- **Bundle manager** — Create, edit, reorder, and archive bundles. Drag-and-drop prompt ordering within a bundle. Preview how the bundle appears to users.
- **Tag manager** — Add, rename, or archive tags. Assign tag type (department vs workflow) which drives the color coding. See how many prompts use each tag.
- **Category manager** — Add or rename use-case categories that organize the sidebar navigation.

### 6.3 Analytics Dashboard

A visual overview of library health and engagement:
- **Usage metrics** — Total copies, views, and AI platform opens over time (line chart). Filterable by time period (7d, 30d, 90d).
- **Top prompts** — Leaderboard of most copied and most viewed prompts.
- **Platform split** — Pie or bar chart showing ChatGPT vs Claude vs Gemini usage.
- **Effectiveness scores** — Prompts ranked by user effectiveness ratings. Highlights prompts that may need improvement.
- **Search gaps** — Queries that returned zero results. Identifies content opportunities — what are users looking for that doesn't exist yet?
- **User engagement** — Active users over time, top contributors (most submissions, most comments).
- **Department breakdown** — Which teams use the library most, which tags are most popular per team.

### 6.4 User Management

- **User list** — All authenticated users with their role (User / Admin), department, last active date.
- **Role assignment** — Promote users to Admin or demote back to User.
- **Activity log** — See recent actions per user (submissions, comments, copies) for moderation purposes.

### 6.5 "Prompt of the Week" Management

- Select any prompt to feature at the top of the library
- Set a schedule (auto-rotate weekly) or manually pick
- Preview how the featured banner appears to users
- History of previously featured prompts

---

## 7. Prioritized Roadmap

### Phase 1: Backend Foundation
Get the library off of hardcoded data and onto a real backend.
- Set up Supabase project (Evan provides access)
- Create database tables and RLS policies
- Implement Google OAuth sign-in
- Migrate existing prompt data → Supabase
- Connect React app to Supabase client SDK
- Replace localStorage favorites with database-backed favorites
- Persist comments to the database
- Deploy to Vercel with Supabase env vars
- Copy button back on cards

### Phase 2: Core Functionality
Make it a real tool people can contribute to.
- Admin dashboard — prompt management, submission queue, approve/reject workflow
- Prompt CRUD for admins (create, edit, delete directly; approve user submissions)
- Prompt submission form for users (draft → review → approved)
- Functional AI platform buttons (URL pre-fill patterns + real platform logos)
- User roles & permissions enforcement (user/admin)
- Tag & category management (admin)
- Bundle management (admin)
- Prompt effectiveness tracking (worked/tweaking/didn't help)
- "Prompt of the Week" featured banner
- Recently used / Quick access section
- Copy button back on prompt cards

### Phase 3: Discovery & Organization
Help people find the right prompt faster.
- Semantic search with pgvector embeddings
- "Describe your problem" search mode
- Collapsible bundles (accordion UI + bundle detail pages)
- User-created collections (personal prompt playlists)
- Related prompts ("You might also need...")
- Guided prompt builder wizard
- Prompt ratings (thumbs up/down)

### Phase 4: Intelligence & Power Features
Make the library smarter and give admins deeper visibility.
- Analytics dashboard (usage metrics, platform split, search gaps, department breakdown)
- User management (role assignment, activity log)
- AI-generated bundle recommendations
- Prompt versioning diff view
- "My Prompts" personal dashboard
- Keyboard shortcuts
- Content gap analysis (from search analytics)

---

## 8. Decisions Made

- **Supabase project** — Evan will provide access to his existing Supabase project
- **Auth** — Google OAuth. All FieldPulse employees have Google Workspace accounts
- **Roles** — Two roles only: **User** and **Admin** (no editor role). Users can submit prompts; admins approve and manage
- **Prompt creation** — Any user can submit prompts, but they require admin approval before going live
- **Approval workflow** — Single approver (admin). Keep it simple
- **Bundle ownership** — Admin-only. Bundles are curated, official workflows
- **Analytics visibility** — Admin-only dashboard

## 9. Open Questions for Evan

1. **Supabase tier** — Free or Pro? Pro is needed for pgvector (semantic search), higher storage, and more edge function invocations
2. **Timeline** — What's the target for Phase 1 (backend foundation) go-live?

---

## 10. References

- [ChatGPT URL pre-fill pattern](https://community.openai.com/t/how-can-i-link-to-chatgpt-web-prepopulating-the-first-prompt-on-the-chat/160695)
- [Claude.ai URL parameters](https://github.com/anthropics/claude-code/issues/19023)
- [Gemini URL prompt extensions](https://chromewebstore.google.com/detail/gemini-url-prompt/kdbgjkfdooaiompgeckjbegnnccchmma)
- [Mintlify contextual menu](https://www.mintlify.com/docs/ai/contextual-menu)
- [How to run a prompt through a URL (multi-platform)](https://linkmyprompt.com/how-to-run-a-prompt-through-a-url-in-chatgpt-perplexity-grok-gemini-claude/)
- [Supabase pgvector docs](https://supabase.com/docs/guides/ai/vector-columns)
- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
