---
title: "feat: Prompt Library High-Fidelity Prototype"
type: feat
status: active
date: 2026-03-30
origin: docs/brainstorms/2026-03-30-prompt-library-prototype-brainstorm.md
---

# Prompt Library High-Fidelity Prototype

## Overview

Build a high-fidelity, client-side-only prototype of FieldPulse's internal Prompt Library using React (Vite), Tailwind CSS v4, and shadcn/ui. No database — hardcoded mock data. The purpose is to validate UI/UX with the PM before investing in backend work. Includes visual representations of the full product vision (Must Have through Could Have features from the PRD), with non-functional features being clickable with static data.

(see brainstorm: `docs/brainstorms/2026-03-30-prompt-library-prototype-brainstorm.md`)

## Problem Statement / Motivation

FieldPulse has 200+ employees using AI tools with zero standardization. The PRD defines a Prompt Library but before building the real product, the team needs to validate the UI/UX with stakeholders. This prototype is the vehicle for that validation — it needs to look and feel like a real product during demos.

## Proposed Solution

A single-page React application with:
- Collapsible team sidebar as primary navigation
- Hybrid browse experience: card grid for team views, table for "All Prompts"
- Global search with real-time filtering
- Category pills + model dropdown for layered filtering
- Right-side drawer for variable fill-in with real-time prompt preview
- Clickable-but-static vision features (versioning, analytics, favorites, bundles, submission workflow)
- Dark mode toggle
- Copy-to-clipboard as the only real functionality

## Technical Approach

### Tech Stack

- **React 19** via Vite 7 (`react-ts` template)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no `tailwind.config.js`, no PostCSS)
- **shadcn/ui** (latest) — components: Sheet, Card, Table, Badge, Command, Popover, Tabs, Button, Input, Dialog, Tooltip, DropdownMenu, ScrollArea, Separator, Sonner (toast)
- **TypeScript** throughout
- **localStorage** for persisting favorites and dark mode preference across refreshes
- **No routing library** — single-page with state-driven views (keeps it simple)

### Key Tailwind v4 Notes

- No `tailwind.config.js` — theme customization via `@theme {}` blocks in CSS
- CSS entry file uses `@import "tailwindcss"` (no `@tailwind` directives)
- `@tailwindcss/vite` as Vite plugin (not PostCSS)
- Buttons default to `cursor: default` — add `cursor-pointer` explicitly
- Border utilities are transparent by default — set explicitly

### Architecture

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components (auto-generated)
│   ├── layout/
│   │   ├── Sidebar.tsx        # Team navigation sidebar
│   │   ├── Header.tsx         # Search bar, model filter, dark mode toggle
│   │   └── AppShell.tsx       # Main layout wrapper
│   ├── prompts/
│   │   ├── PromptCard.tsx     # Card component for team views
│   │   ├── PromptTable.tsx    # Table component for "All Prompts" view
│   │   ├── PromptDrawer.tsx   # Detail/variable-fill drawer (right side)
│   │   ├── CategoryPills.tsx  # Horizontal category filter pills
│   │   ├── ModelFilter.tsx    # Model dropdown filter
│   │   ├── PromptGrid.tsx     # Card grid layout wrapper
│   │   └── PromptBundle.tsx   # Bundle grouping component
│   └── vision/
│       ├── VersionHistory.tsx # Static version history drawer content
│       ├── SubmitPrompt.tsx   # Prompt submission form (dialog)
│       ├── FavoriteButton.tsx # Heart/bookmark toggle
│       └── UsageStats.tsx     # Static usage analytics display
├── data/
│   ├── prompts.ts             # All mock prompt data
│   ├── teams.ts               # Team definitions and categories
│   └── types.ts               # TypeScript interfaces
├── hooks/
│   ├── useSearch.ts           # Search filtering logic
│   ├── useFilters.ts          # Category + model filter state
│   ├── useFavorites.ts        # Favorites with localStorage
│   └── useTheme.ts            # Dark mode toggle with localStorage
├── lib/
│   ├── utils.ts               # shadcn cn() utility
│   └── variables.ts           # {{variable}} parsing utilities
├── App.tsx                    # Root component with state management
└── main.tsx                   # Entry point
```

### Design Decisions Carried Forward from Brainstorm

| Decision | Details |
|----------|---------|
| Landing view | "All Prompts" table view, no separate dashboard |
| Team browse | Card grid when viewing a specific team |
| Prompt detail | Drawer-based, no full-page detail view |
| Variable fill-in | Right-side Sheet with real-time preview |
| Filtering | Sidebar = Team, pills = Category, dropdown = Model |
| Vision features | Clickable with static mock data |
| Dark mode | Yes, with toggle, persisted to localStorage |
| Demo audience | PM/manager, mock data representative but not production-quality |

### Gap Resolutions (from SpecFlow Analysis)

These gaps were identified during spec analysis. Default resolutions are baked into this plan:

| Gap | Resolution |
|-----|-----------|
| "All Prompts" in sidebar | First item in sidebar, above team list, active by default on load |
| Card click behavior | Clicking card body opens the right-side detail drawer |
| "Use Prompt" on cards without variables | Button hidden on cards with no variables; only "Copy" button shows |
| Search scope | Always global — clears team selection, shows team badges on results |
| Filter reset on team switch | Category pills reset (team-specific). Model filter persists |
| Empty states | Contextual messages for: empty team, no favorites, no search results |
| Drawer collision | Only one drawer open at a time; new drawer closes previous |
| Unfilled variables in copied text | Remain as `{{variable_name}}` in copied text |
| localStorage usage | Yes — for favorites and dark mode preference |
| Sidebar collapsible | Chevron icon collapses to icons-only mode |
| Card text truncation | 2-3 lines via CSS `line-clamp`, ~120-150 characters |
| Submit form fields | Title, Description, Prompt Text, Team, Category, Model, variable preview |
| Mock data coverage | All 7 teams get prompts (3-4 teams get 5-8, remaining get 1-2 placeholders) |

### Implementation Phases

#### Phase 1: Project Scaffolding

**Goal:** Working dev server with all dependencies installed.

- [ ] Scaffold Vite + React + TypeScript project
- [ ] Install and configure Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- [ ] Configure TypeScript path aliases (`@/`) in `vite.config.ts` and `tsconfig.json`
- [ ] Initialize shadcn/ui (`pnpm dlx shadcn@latest init`)
- [ ] Install all required shadcn components: `sheet card table badge command popover tabs button input dialog tooltip dropdown-menu scroll-area separator`
- [ ] Install `sonner` for toast notifications
- [ ] Set up `@theme {}` block in `src/index.css` for custom colors (model tag colors, brand colors)
- [ ] Verify dev server runs with a "Hello World" page

**Files created:**
- `vite.config.ts`
- `tsconfig.json`, `tsconfig.app.json`
- `src/index.css` (Tailwind v4 entry)
- `src/components/ui/*` (shadcn components)
- `src/lib/utils.ts`

**Setup commands:**
```bash
pnpm create vite@latest prompt-library -- --template react-ts
cd prompt-library
pnpm install
pnpm add -D tailwindcss @tailwindcss/vite @types/node
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add sheet card table badge command popover tabs button input dialog tooltip dropdown-menu scroll-area separator sonner
```

#### Phase 2: Data Layer & Types

**Goal:** All mock data and TypeScript types defined.

- [ ] Define TypeScript interfaces in `src/data/types.ts`:
  - `Prompt` (id, title, description, promptText, teamId, categoryId, models, variables, version, copyCount, isTrending, bundleId, status, createdAt, updatedAt, author)
  - `Team` (id, name, icon, categories)
  - `Category` (id, name, teamId)
  - `Variable` (name, description, type?)
  - `VersionEntry` (version, date, author, changeDescription)
  - `Bundle` (id, name, description, promptIds)
- [ ] Define team data in `src/data/teams.ts` — all 7 teams with their categories
- [ ] Create mock prompt data in `src/data/prompts.ts`:
  - Sales: 6 prompts (outreach, objection handling, proposals, lead qualification, competitor comparison, follow-up)
  - Customer Success: 6 prompts (ticket response, onboarding script, churn prevention, check-in, escalation, QBR prep)
  - Engineering: 4 prompts (code review, documentation, debugging, architecture decision)
  - Product: 4 prompts (PRD writing, user stories, release notes, competitive analysis)
  - Implementation: 2 prompts (setup guide, migration checklist)
  - Marketing: 2 prompts (blog outline, social media copy)
  - QA: 2 prompts (test case generation, bug report template)
  - Include prompts with 0, 1, 3, and 5+ variables to test all states
  - Mark 3-4 prompts as "Trending"
  - Create 1 bundle: "New Customer Onboarding" (3 related CS prompts)
  - Mix of models: some ChatGPT, some Claude, some Gemini, some Model-Agnostic
  - Include 1-2 prompts with "Pending Review" status
- [ ] Create `src/lib/variables.ts` — utility to parse `{{variable_name}}` from prompt text and return variable list

**Files created:**
- `src/data/types.ts`
- `src/data/teams.ts`
- `src/data/prompts.ts`
- `src/lib/variables.ts`

#### Phase 3: Layout Shell

**Goal:** Sidebar + header + content area rendering with navigation state.

- [ ] Build `src/components/layout/AppShell.tsx` — flex layout with sidebar + main content
- [ ] Build `src/components/layout/Sidebar.tsx`:
  - "All Prompts" item at top (default active)
  - Team list with icons
  - "My Favorites" item below teams
  - Collapsible via chevron (icons-only mode)
  - Active state highlighting
  - "Submit New Prompt" button at bottom
- [ ] Build `src/components/layout/Header.tsx`:
  - Search bar (shadcn Command or Input with search icon)
  - Model filter dropdown (shadcn DropdownMenu)
  - Dark mode toggle button (sun/moon icon)
- [ ] Implement `src/hooks/useTheme.ts` — dark mode toggle persisted to localStorage
- [ ] Wire up dark mode in `src/index.css` using Tailwind's `dark:` classes
- [ ] Implement view state: which team is selected (null = All Prompts), manage in App.tsx

**Files created:**
- `src/components/layout/AppShell.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Header.tsx`
- `src/hooks/useTheme.ts`
- `src/App.tsx` (updated with layout)

#### Phase 4: Browse Views (Cards + Table)

**Goal:** Both browse experiences working with mock data.

- [ ] Build `src/components/prompts/PromptCard.tsx`:
  - Title + model tag badge (colored: ChatGPT=green, Claude=orange, Gemini=blue, Agnostic=gray)
  - Team tag badge
  - Description (2-3 line clamp)
  - Prompt text preview (2 line clamp, monospace, muted)
  - "Copy" button (primary) — functional, uses `navigator.clipboard.writeText()` + toast
  - "Use Prompt" button (secondary) — only shown if prompt has variables
  - Version badge (e.g., "v3"), copy count, "Trending" badge where applicable
  - Favorite heart icon (toggle)
  - Clickable card body opens detail drawer
- [ ] Build `src/components/prompts/PromptGrid.tsx` — responsive CSS grid wrapper for cards
- [ ] Build `src/components/prompts/PromptTable.tsx`:
  - Columns: Title, Team, Category, Model(s), Copies, Version, Actions
  - Row click opens detail drawer
  - "Copy" button in actions column
  - Sortable by title or copies (client-side)
- [ ] Build `src/components/prompts/CategoryPills.tsx`:
  - Horizontal scrollable row of pill buttons
  - "All" pill as first item (default active)
  - Pills change based on selected team's categories
  - Hidden when on "All Prompts" view (too many categories)
- [ ] Build `src/components/prompts/ModelFilter.tsx`:
  - Dropdown with: All Models, ChatGPT, Claude, Gemini, Model-Agnostic
  - Shows active filter as selected state
- [ ] Build `src/components/prompts/PromptBundle.tsx`:
  - Visual grouping container with bundle name and description
  - Contains child PromptCards
  - Collapsible/expandable
- [ ] Wire browse views to sidebar navigation state
- [ ] Implement empty states:
  - Team with no prompts: "No prompts for [Team] yet. Be the first to submit one!"
  - No results after filtering: "No prompts match your filters. Try broadening your search."

**Files created:**
- `src/components/prompts/PromptCard.tsx`
- `src/components/prompts/PromptGrid.tsx`
- `src/components/prompts/PromptTable.tsx`
- `src/components/prompts/CategoryPills.tsx`
- `src/components/prompts/ModelFilter.tsx`
- `src/components/prompts/PromptBundle.tsx`

#### Phase 5: Search

**Goal:** Global search filtering prompts in real-time.

- [ ] Build `src/hooks/useSearch.ts`:
  - Filters across title, description, tags, and prompt text
  - Case-insensitive matching
  - Returns filtered prompt list
  - Clears team selection when search is active (global scope)
- [ ] Update Header search input to control search state
- [ ] Search results displayed in card grid format with team badges on each card
- [ ] Clear search button (X icon) to reset
- [ ] Empty search state: "No prompts found for '[query]'. Try a different search term."
- [ ] Debounce search input (300ms) for smooth filtering

**Files created:**
- `src/hooks/useSearch.ts`

#### Phase 6: Variable Fill-In Drawer

**Goal:** The core "Use Prompt" interaction working end-to-end.

- [ ] Build `src/components/prompts/PromptDrawer.tsx` using shadcn Sheet (right side):
  - **Left section (within drawer):** Full prompt text with `{{variables}}` highlighted in a distinct color/background
  - **Right section / below:** Auto-generated input fields for each detected variable
  - Variable labels derived from variable names (e.g., `customer_name` → "Customer Name")
  - Real-time text update: as user types in a field, the corresponding `{{variable}}` in the prompt text gets replaced visually
  - "Copy Filled Prompt" button at bottom — functional clipboard copy + toast
  - Unfilled variables remain as `{{variable_name}}` in copied text
  - Close button + click-outside-to-close + Escape key
- [ ] Also serves as prompt detail view when card body is clicked:
  - Shows full prompt text (read-only if no variables)
  - Shows metadata: team, category, model, version, copy count, author
  - Shows vision elements: version history link, usage stats
- [ ] Build `src/hooks/useFilters.ts` — manages category + model filter state, resets categories on team switch

**Files created:**
- `src/components/prompts/PromptDrawer.tsx`
- `src/hooks/useFilters.ts`

#### Phase 7: Vision Features (Clickable but Static)

**Goal:** All Should Have and Could Have features visually represented.

- [ ] Build `src/components/vision/FavoriteButton.tsx`:
  - Heart icon toggle (filled/unfilled)
  - Persisted to localStorage via `src/hooks/useFavorites.ts`
  - "My Favorites" sidebar section shows favorited prompts
  - Empty favorites state: "No favorites yet. Click the heart icon on any prompt to save it here."
- [ ] Build `src/hooks/useFavorites.ts` — manages favorite IDs in localStorage
- [ ] Build `src/components/vision/VersionHistory.tsx`:
  - Triggered by clicking version badge on card/drawer
  - Opens a secondary Sheet or section within the detail drawer
  - Shows 3-4 mock version entries with: version number, date, author name, one-line change description
  - Only one drawer open at a time (version history replaces detail drawer)
- [ ] Build `src/components/vision/SubmitPrompt.tsx`:
  - Triggered by "Submit New Prompt" button in sidebar
  - Opens a Dialog (modal) with form fields: Title, Description, Prompt Text (textarea), Team (select), Category (select), Model (multi-select checkboxes)
  - Shows detected `{{variables}}` preview below the prompt text textarea
  - "Submit for Review" button — shows success toast, does nothing else
- [ ] Build `src/components/vision/UsageStats.tsx`:
  - Small inline component showing "Copied X times this week" with a mini bar or number
  - Shown in the detail drawer metadata section
- [ ] Add "Pending Review" status badge on 1-2 mock prompts — yellow badge variant

**Files created:**
- `src/components/vision/FavoriteButton.tsx`
- `src/components/vision/VersionHistory.tsx`
- `src/components/vision/SubmitPrompt.tsx`
- `src/components/vision/UsageStats.tsx`
- `src/hooks/useFavorites.ts`

#### Phase 8: Polish & Dark Mode

**Goal:** Prototype looks production-quality for the demo.

- [ ] Ensure all components have proper dark mode variants via `dark:` classes
- [ ] Model tag badge colors work in both themes (sufficient contrast)
- [ ] Smooth transitions on: sidebar collapse, drawer open/close, theme toggle, filter changes
- [ ] Toast notifications (sonner) for: clipboard copy success, favorite added/removed, prompt submitted
- [ ] Loading/transition states: subtle fade when switching teams or filtering
- [ ] Responsive basics: content area adapts if sidebar collapses, cards reflow in grid
- [ ] Final pass on spacing, typography, and visual consistency
- [ ] Test all interactive flows end-to-end:
  - Browse by team → filter by category → filter by model → click card → view drawer → copy
  - Search → click result → use prompt → fill variables → copy filled prompt
  - Toggle favorites → view My Favorites
  - Click version badge → view mock history
  - Submit new prompt → see toast
  - Toggle dark mode → verify all views

**No new files — edits across all existing components.**

## Acceptance Criteria

### Functional Requirements

- [ ] App loads to "All Prompts" table view with all mock prompts
- [ ] Sidebar shows "All Prompts", 7 teams, and "My Favorites"
- [ ] Clicking a team shows that team's prompts as a card grid
- [ ] Category pills appear and filter correctly within a team view
- [ ] Model dropdown filters prompts by AI model
- [ ] Search bar filters prompts globally with real-time results
- [ ] "Copy to Clipboard" button copies prompt text and shows toast
- [ ] "Use Prompt" button opens right-side drawer with variable inputs
- [ ] Variables in prompt text update in real-time as user types
- [ ] "Copy Filled Prompt" copies the substituted text
- [ ] Heart icon toggles favorites, persisted across refresh
- [ ] "My Favorites" section shows favorited prompts
- [ ] Version badge click shows mock version history
- [ ] "Submit New Prompt" opens a form dialog
- [ ] Dark mode toggle works, preference persisted
- [ ] Sidebar collapses to icon-only mode
- [ ] Empty states shown for: empty teams, no search results, no favorites
- [ ] At least 26 mock prompts across all 7 teams

### Non-Functional Requirements

- [ ] No build errors or console warnings
- [ ] All interactions feel responsive (no perceptible lag)
- [ ] Dark and light modes both look polished
- [ ] Consistent spacing and typography throughout

## Dependencies & Risks

| Risk | Mitigation |
|------|-----------|
| Tailwind v4 breaking changes from v3 tutorials | Setup commands verified against latest docs; no `tailwind.config.js` needed |
| shadcn/ui component compatibility with Tailwind v4 | shadcn supports Tailwind v4 natively; `components.json` tailwind config field left empty |
| Mock data feels thin during demo | 26+ prompts across all 7 teams, with variables, bundles, and trending badges |
| Drawer interactions feel janky | Use shadcn Sheet component (Radix-based), handles animations and focus management |
| Scope creep into real functionality | Strict boundary: only clipboard copy is functional. Everything else is visual. |

## Sources & References

### Origin

- **Brainstorm document:** [docs/brainstorms/2026-03-30-prompt-library-prototype-brainstorm.md](../brainstorms/2026-03-30-prompt-library-prototype-brainstorm.md) — Key decisions: hybrid cards+table browse, right-side variable drawer, layered filtering, clickable-but-static vision features
- **Product brief:** [prompt_library_product_brief.md](../../prompt_library_product_brief.md) — MoSCoW prioritization, Information Architecture, tagging taxonomy

### External References

- [Vite Getting Started](https://vite.dev/guide)
- [shadcn/ui Vite Installation](https://ui.shadcn.com/docs/installation/vite)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- Langfuse prompt management — variable detection and playground patterns
- Egnyte prompt library — task category tabs and job type filtering
- Vellum AI — Rich Text Block `{{` variable dropdown pattern
