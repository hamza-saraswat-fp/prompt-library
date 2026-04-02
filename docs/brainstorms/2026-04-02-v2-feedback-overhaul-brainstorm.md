# FieldPulse Prompt Library v2 Overhaul — Brainstorm

**Date:** 2026-04-02
**Status:** Draft
**Author:** Hamza + Claude

---

## What We're Building

A comprehensive v2 overhaul of the FieldPulse Prompt Library based on PM and team feedback. The changes span data model, views, navigation, branding, and new features. We're breaking this into **6 independent plans** that can be tackled sequentially.

---

## Why This Approach

The feedback covers ~12 distinct items ranging from quick removals to significant new features (routing, comments). Rather than one monolithic plan, we split into phases that each deliver a shippable improvement. Earlier phases lay the data model groundwork that later phases depend on.

---

## Plan Breakdown

### Plan 1: Data Model Cleanup & Tag System
**Scope:** Foundation changes that everything else builds on.

**Changes:**
- **Remove `model` field** from display/filters entirely (keep in data for future use if needed, but strip from UI)
- **Remove `status: "pending"`** — all prompts are approved; remove the status field and any pending-related UI
- **Add `tags: string[]`** to the Prompt interface — admin-managed, predefined set
- **Convert departments to tags** — departments like "Sales", "Engineering" become tags rather than a separate filter axis
- **Remove `departments` as a separate concept** — they're now just tags with a "department:" prefix or a tag category
- **Add `useCases: UseCase[]`** to data model — each with `input` and `output` strings for the "See it in action" section
- **Add `comments: Comment[]`** structure — `{ id, author, text, createdAt }`
- **Define predefined tag list** — department tags + workflow tags (e.g., "onboarding", "documentation", "troubleshooting", "customer-facing", "internal")

**Key decision:** Tags are admin-managed (predefined set). Departments become tags. This avoids fragmenting the database while keeping discovery flexible.

---

### Plan 2: View Toggle & Table Overhaul
**Scope:** Card/table toggle + make the table actually useful.

**Changes:**
- **Add view toggle** (card/table) in the header area — persist preference in localStorage
- **Card view as default** — when no group is selected, show cards (currently shows table for "all prompts")
- **Overhaul table columns:**
  - Keep: Title, Tags (new), Category
  - Remove: Model, Team/Department, Copies, Version, Copy button
  - Add: Overview snippet (truncated), Tags as badges
- **Add sorting:** Sort by title (A-Z / Z-A) — simple dropdown or clickable column headers
- **Add tag-based filtering:** Multi-select tag filter in the header filter bar
- **Remove model filter** from header
- **Remove department filter** — replaced by tag filtering
- **Ensure table isn't zoomed in** — review spacing, font sizes, padding for a more compact/scannable layout

**Key decision:** Table removes all low-value columns (model, copies, version, copy button) and adds tags + overview snippet to make rows informative enough to evaluate a prompt without opening it.

---

### Plan 3: AI Platform Buttons (Replace Copy)
**Scope:** Replace all copy buttons with "Open in ChatGPT/Claude/Gemini" actions.

**Changes:**
- **Replace copy button everywhere** (drawer, detail view, card) with AI platform action buttons
- **Button behavior:** Copy the (filled) prompt text to clipboard AND open the platform URL in a new tab
  - ChatGPT: `https://chatgpt.com/`
  - Claude: `https://claude.ai/new`
  - Gemini: `https://gemini.google.com/`
- **Button styling:** Compact icon buttons or a button group (similar to Mintlify "Open in..." pattern)
- **Drawer copy area:** Shrink from the current oversized button to a compact row of 3 platform buttons
- **Detail view:** Same compact button group in the sticky sidebar
- **Card view:** Remove copy button from card entirely (user must open prompt to use it — you can't evaluate a prompt from the title alone)
- **Table view:** No copy button on rows (already decided to remove it)

**Key decision:** AI platform buttons fully replace the copy button. Clicking one copies the prompt AND opens the platform. No standalone "copy to clipboard" action.

---

### Plan 4: URL Routing & Prompt Pages
**Scope:** Give every prompt a shareable URL.

**Changes:**
- **Add React Router** (react-router-dom) to the project
- **Route structure:**
  - `/` — Browse view (card/table with filters)
  - `/prompts/:id` — Dedicated prompt detail page (currently the "detail view" but now URL-routable)
  - Optional: `/prompts/:id?tab=comments` for deep-linking to comments
- **Replace state-based navigation** — `viewMode`, `selectedPrompt` state → route-based rendering
- **Sidebar links** still work as filter state within the `/` route
- **Drawer behavior:** Drawer still opens over browse view for quick preview, but the "Full View" button navigates to `/prompts/:id`
- **Share button** on prompt detail page — copies the URL to clipboard
- **Browser back/forward** work naturally

**Key decision:** Prompts get their own URL via React Router. The drawer remains for quick preview, but the full detail page is a real route.

---

### Plan 5: FieldPulse Branding
**Scope:** Make it look like a FieldPulse product.

**Changes:**
- **Add FieldPulse logo** to the header/sidebar (user will provide the logo file)
- **Add slogan/tagline** under the logo: **"AI for the Field"**
- **Favicon update** if needed to match FieldPulse brand
- **Color scheme review** — ensure primary colors align with FieldPulse brand palette
- **Header styling** — branded header bar with logo + app name + slogan

**Key decision:** Branding is a separate plan so it doesn't block functional work. Logo needs to be provided by the user.

---

### Plan 6: Comments & Use Cases
**Scope:** Add feedback mechanism and example demonstrations.

**Changes:**
- **Text comments on prompts:**
  - Comment input area on the prompt detail page (`/prompts/:id`)
  - Display existing comments in chronological order
  - Author name + timestamp + text
  - **Static/mock only for prototype** — show UI with mock comments, no actual persistence. Backend integration planned for future.
- **"See it in action" collapsible section:**
  - On prompt detail page, below the prompt text
  - Collapsible/expandable section
  - Shows example use cases with input (what user provides) and output (what AI returns)
  - Pre-authored by prompt creators, stored in prompt data
  - Styled as a before/after or input/output card pair

**Key decision:** Comments use text input (not just thumbs up/down). For the prototype, localStorage persistence is acceptable. Use cases are static pre-authored examples in the data, displayed in a collapsible section.

---

## Recommended Execution Order

```
Plan 1 (Data Model) → Plan 2 (Views) → Plan 3 (AI Buttons) → Plan 4 (Routing) → Plan 5 (Branding) → Plan 6 (Comments/Use Cases)
```

**Why this order:**
1. **Plan 1 first** — Tags and data model changes are the foundation everything else references
2. **Plan 2 second** — View toggle and table overhaul use the new tag system
3. **Plan 3 third** — AI buttons can be done independently but benefit from the new view structure
4. **Plan 4 fourth** — Routing is a structural change best done after views are stable
5. **Plan 5 fifth** — Branding is cosmetic and can layer on top of anything
6. **Plan 6 last** — Comments and use cases are new features that layer on top of the routed prompt pages

Plans 3 and 5 could be swapped or parallelized. Plans 1-2 must come before 4.

---

## Key Decisions Summary

| Decision | Choice | Rationale |
|---|---|---|
| AI buttons vs copy | Replace copy entirely | Matches Mintlify pattern, more actionable |
| Tag management | Admin-managed predefined set | Keeps library clean and consistent |
| Departments | Become tags | Flexible discovery without fragmenting DB |
| Comments | Text comments | Richer feedback than thumbs up/down |
| Use cases | Collapsible section with static data | Pre-authored input/output examples |
| Model field | Remove from UI | Most prompts are model-agnostic anyway |
| Pending status | Remove entirely | Unnecessary for current use case |
| Table copy button | Remove | Can't evaluate prompt from title alone |
| Routing | React Router with `/prompts/:id` | Enables sharing and deep-linking |

---

## Open Questions

1. **Logo file** — Where is the FieldPulse logo file? What format (SVG preferred)? User needs to provide this.
2. **Predefined tag list** — What's the initial set of tags beyond departments? Any workflow/use-case tags to include? (Can be refined during Plan 1 implementation.)

---

## Resolved Questions

- **Slogan:** "AI for the Field"
- **Card view layout for "all prompts":** Flat grid (no grouping), rely on search/filter/tags for discovery
- **Comment persistence:** Static/mock only for the prototype — show the UI with mock comments, no actual persistence yet
