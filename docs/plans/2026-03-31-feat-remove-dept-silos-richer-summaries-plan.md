---
title: "feat: Remove Department Silos & Add Richer Prompt Summaries"
type: feat
status: active
date: 2026-03-31
origin: docs/brainstorms/2026-03-31-remove-dept-silos-richer-summaries-brainstorm.md
---

# Remove Department Silos & Add Richer Prompt Summaries

## Overview

Refactor the Prompt Library prototype's information architecture based on PM feedback. Two connected changes: (1) replace department-based sidebar navigation with use-case group navigation, converting departments to multi-select tags; (2) enrich prompt card descriptions from simple one-liners to richer overviews with a "Read more" affordance.

This touches the data model, ~10 components, and the core filtering logic in App.tsx.

(see brainstorm: `docs/brainstorms/2026-03-31-remove-dept-silos-richer-summaries-brainstorm.md`)

## Problem Statement / Motivation

The v1 prototype organizes prompts by department (7 sidebar entries). PM feedback: this creates silos and competition between teams. A "Meeting Analysis" prompt created by Sales is equally useful for CS, Product, and Account Management. The library should feel like a shared company resource, not team-owned sections. Additionally, simple one-line descriptions don't give enough context for cross-team discovery.

## Proposed Solution

Replace the team-based sidebar with **use-case groups** (Writing & Communication, Analysis & Research, etc.). Departments become **multi-select tags** on prompts with a filter dropdown in the header. Prompt cards show a **richer overview** (2-3 lines + "Read more" to open drawer).

## Technical Approach

### Architecture Changes

**Data model:** `Prompt.teamId` → `Prompt.departments[]`, `Prompt.description` → `Prompt.overview`, `Category.teamId` → `Category.groupId`. New `UseCaseGroup` type replaces `Team`.

**State:** `selectedTeam` → `selectedGroup`, new `selectedDepartments: string[]` state. Department filter uses OR (union) logic.

**View logic:** `isCardView` triggers on `selectedGroup !== null` (instead of `selectedTeam`). Favorites view renders as cards.

### Gap Resolutions (from SpecFlow Analysis)

These gaps were identified during spec analysis. Default resolutions are baked into this plan:

| Gap | Resolution |
|-----|-----------|
| Department filter boolean logic | **OR (union)** — show prompts tagged with ANY selected department. Users want "anything relevant to my teams." |
| Department filter persistence | **Persists** across sidebar navigation, matching model filter behavior. Visible filter chips in header show active departments. |
| Department filter during search | **Respected** — search results are narrowed by active department filter (same as model filter behavior). `preSearchState` captures `selectedDepartments`. |
| "Read more" behavior on cards | **Opens the drawer** (same as card click). Simpler than inline expansion; avoids dynamic card heights disrupting the grid. |
| Favorites view format | **Cards** — more scannable for a small personal collection. Department + model filters apply to favorites. |
| Category pills with zero results | **Show all pills, dim zero-result ones.** No counts in prototype. |
| Submit form department UI | **Toggleable pill buttons** — matches existing model selection pattern in SubmitPrompt.tsx. |
| Submit form validation | At least **one department required**. Category is **required**. Overview is **required**. |
| Submit form category selection | **Grouped dropdown** — categories listed under their use-case group headers. |
| Sidebar counts | **Not in this iteration.** Keep sidebar clean for prototype. |
| Category deduplication | **Merge duplicates** into single global category placed in the most intuitive group. |
| Icons for use-case groups | Lucide icons: PenLine (Writing), BarChart3 (Analysis), Headphones (Customer Ops), Code (Development), Target (Planning), Palette (Content) |

### Implementation Phases

#### Phase 1: Data Model & Types

**Goal:** New type definitions and restructured mock data. Everything downstream depends on this.

- [ ] Update `src/data/types.ts`:
  - Add `UseCaseGroup` interface: `{ id, name, icon, categoryIds[] }`
  - Update `Prompt`: `teamId: string` → `departments: string[]`, `description: string` → `overview: string`
  - Update `Category`: `teamId: string` → `groupId: string`
  - Remove `Team` interface (or keep as `Department` type alias for the tag list)
  - Add `DEPARTMENTS` constant array: `["Sales", "Customer Success", "Implementation", "Engineering", "Product", "Marketing", "QA"]`
- [ ] Create/restructure `src/data/teams.ts` → `src/data/groups.ts` (or update in-place):
  - Define 6 use-case groups with their category mappings
  - Define global categories (deduplicated from current 24 team-scoped categories)
  - Keep bundles (unchanged structure)
  - Add helper functions: `getGroupById()`, `getCategoriesForGroup()`, `getCategoryById()`
- [ ] Migrate all 26+ prompts in `src/data/prompts.ts`:
  - `teamId: "sales"` → `departments: ["Sales"]` (or multi-tag where appropriate)
  - `description: "..."` → `overview: "..."` (expand to 2-4 sentences)
  - `categoryId` values updated to new global category IDs
  - Tag cross-team prompts with multiple departments (e.g., meeting analysis → `["Sales", "Product", "Customer Success"]`)

**Category-to-Group Mapping:**

| Use-Case Group | Categories (merged from current teams) |
|---|---|
| **Writing & Communication** | Outreach, Proposals, Follow-Up, Email Drafts, Check-In Messaging, Social Media Copy |
| **Analysis & Research** | Competitive Analysis, Lead Qualification, Data Analysis, Meeting Analysis |
| **Customer Operations** | Ticket Response, Onboarding, Churn Prevention, Escalation, QBR Prep |
| **Development & Technical** | Code Review, Debugging, Documentation, Architecture, Test Cases, Bug Reports |
| **Planning & Strategy** | PRDs, User Stories, Release Notes, Sprint Planning, Migration Checklists, Setup Guides |
| **Content & Marketing** | Blog Posts, Campaign Briefs, SEO, Training Materials |

**Files modified:**
- `src/data/types.ts`
- `src/data/teams.ts` (renamed or restructured)
- `src/data/prompts.ts`

#### Phase 2: Core State & Filter Logic

**Goal:** App.tsx state management updated. Filtering works with new data model.

- [ ] Update `src/App.tsx` state:
  - `selectedTeam: string | null` → `selectedGroup: string | null`
  - Add `selectedDepartments: string[]` (default: empty = show all)
  - Update `preSearchState` type to include `selectedGroup` and `selectedDepartments`
- [ ] Rewrite `filteredPrompts` useMemo:
  - Search path: match against `overview` (was `description`), `title`, `promptText`, `models`. Respect `selectedModel` AND `selectedDepartments` during search.
  - Favorites path: filter by favorites, then apply `selectedModel` and `selectedDepartments`.
  - Browse path: filter by `categoryId` membership in selected group's categories (was `teamId === selectedTeam`), then `selectedCategory`, then `selectedModel`, then `selectedDepartments`.
  - Department filter logic: `prompt.departments.some(d => selectedDepartments.includes(d))` — OR/union.
- [ ] Update `isCardView` logic: `selectedGroup !== null && !searchQuery` (was `selectedTeam !== null`)
- [ ] Update `handleSelectTeam` → `handleSelectGroup`: reset category, clear search, keep department filter
- [ ] Update `handleSearch`: stash/restore now includes `selectedGroup` and `selectedDepartments`
- [ ] Add `handleDepartmentFilter(departments: string[])` handler
- [ ] Update `categories` derivation: `selectedGroup ? getCategoriesForGroup(selectedGroup) : []`
- [ ] Update `viewTitle` to use group names instead of team names
- [ ] Update `getTeamName` helper → derive department names from the prompt's `departments[]` array
- [ ] Update favorites view: ensure `showFavorites` triggers card view (add to `isCardView` condition: `showFavorites || selectedGroup !== null`)

**Files modified:**
- `src/App.tsx`

#### Phase 3: Sidebar

**Goal:** Sidebar renders use-case groups instead of teams.

- [ ] Update `src/components/layout/Sidebar.tsx`:
  - Import `useCaseGroups` (was `teams`)
  - Replace team iteration with group iteration
  - Update `iconMap` with new group icons: `{ writing: PenLine, analysis: BarChart3, customer-ops: Headphones, development: Code, planning: Target, content: Palette }`
  - Update props: `selectedTeam` → `selectedGroup`, `onSelectTeam` → `onSelectGroup`
  - Keep "All Prompts" (top), "My Favorites", "Submit Prompt" unchanged
  - Active state: `selectedGroup === group.id`

**Files modified:**
- `src/components/layout/Sidebar.tsx`

#### Phase 4: Header — Department Filter

**Goal:** Multi-select department filter dropdown in header alongside model filter.

- [ ] Update `src/components/layout/Header.tsx`:
  - Add department filter dropdown (DropdownMenu with checkboxes or Popover with toggleable pills)
  - Show selected departments as count badge on the trigger button (e.g., "Departments (3)")
  - "Clear all" option in the dropdown
  - Props: add `selectedDepartments: string[]`, `onDepartmentChange: (departments: string[]) => void`
  - Layout: Search | Department Filter | Model Filter | Theme Toggle

**Files modified:**
- `src/components/layout/Header.tsx`

#### Phase 5: Prompt Cards — Departments & Overview

**Goal:** Cards show department tag pills and richer overview with "Read more".

- [ ] Update `src/components/prompts/PromptCard.tsx`:
  - Replace single `teamName` badge with `departments` pills (map over `prompt.departments`, show as outline badges)
  - Cap visible department pills at 2-3, show "+N more" overflow if needed
  - Replace `description` render with `overview` — keep `line-clamp-3`
  - Add "Read more" text link after the clamped overview — clicking it triggers the same `onClick` (opens drawer)
  - Update props: `teamName: string` → remove (derive departments from `prompt.departments` directly)
- [ ] Update `src/components/prompts/PromptGrid.tsx` — no changes expected (just a grid wrapper)

**Files modified:**
- `src/components/prompts/PromptCard.tsx`

#### Phase 6: Prompt Table — Departments Column

**Goal:** Table shows multi-department pills instead of single team badge.

- [ ] Update `src/components/prompts/PromptTable.tsx`:
  - Rename "Team" column header → "Departments"
  - Render `prompt.departments.map(...)` as multiple small badges (cap at 2 visible + overflow)
  - Remove `teams` prop, remove `getTeamName` / `getCategoryName` helpers that depend on team structure
  - Add `getCategoryName` that looks up global category by ID
  - Update category column to use global category lookup

**Files modified:**
- `src/components/prompts/PromptTable.tsx`

#### Phase 7: Drawer & Detail View — Overview + Departments

**Goal:** Drawer and full detail view show complete overview and department tags.

- [ ] Update `src/components/prompts/PromptDrawer.tsx`:
  - Replace `teamName` badge with multiple department badges
  - Replace `prompt.description` with `prompt.overview` (full text, no truncation in drawer)
  - Update props: remove `teamName`, add department display logic
  - Ensure `min-h-0` on ScrollArea (from prior learnings — critical for scroll behavior)
- [ ] Update `src/components/prompts/PromptDetailView.tsx`:
  - Same changes: multiple department badges, `overview` text
  - Update bundle sibling cards: pass `departments` instead of single `teamName`
  - Update props cascade

**Files modified:**
- `src/components/prompts/PromptDrawer.tsx`
- `src/components/prompts/PromptDetailView.tsx`

#### Phase 8: Category Pills & Submit Form

**Goal:** Category pills work with use-case groups. Submit form updated for new model.

- [ ] Update `src/components/prompts/CategoryPills.tsx`:
  - No structural changes needed — still receives `categories[]` and renders pills
  - Categories now come from `getCategoriesForGroup()` instead of `getCategoriesForTeam()`
  - Optionally: dim pills with zero results under current filters (visual only, still clickable)
- [ ] Update `src/components/vision/SubmitPrompt.tsx`:
  - Replace "Team" single-select dropdown with **department pill toggles** (multi-select, matching model selection pattern)
  - Replace team-scoped category dropdown with **grouped category dropdown** (categories listed under use-case group headers)
  - Replace "Description" input with "Overview" textarea (with placeholder guidance: "2-4 sentences: what this prompt does, when to use it, and what kind of output to expect")
  - Update validation: `canSubmit = title && overview && promptText && departments.length > 0 && categoryId`
  - Update form state: `teamId` → `departments: string[]`, `description` → `overview`

**Files modified:**
- `src/components/prompts/CategoryPills.tsx`
- `src/components/vision/SubmitPrompt.tsx`

#### Phase 9: Polish & Cleanup

**Goal:** Everything looks and works correctly end-to-end.

- [ ] Remove dead code: any remaining `Team` type references, `getTeamById`, `getCategoriesForTeam`, `teamId` references
- [ ] Update `src/lib/constants.ts` if any team-specific constants exist
- [ ] Test all flows:
  - Browse by group → category pill → department filter → model filter → card click → drawer → copy
  - "All Prompts" table → department filter → click row → drawer
  - Search with department filter active → clear search → verify state restoration
  - Favorites view (cards) → department filter → model filter
  - Submit form → select departments → select category → fill overview → submit toast
  - Toggle dark mode → verify all new elements (department pills, filter dropdown) look correct
  - Sidebar collapse → verify group icons render correctly
- [ ] Empty states:
  - Group with no prompts matching current department filter: "No prompts match your filters. Try broadening your selection."
  - No favorites: "No favorites yet. Click the heart icon on any prompt to save it here." (unchanged)
  - No search results: "No prompts found for '[query]'. Try a different search term." (unchanged)
- [ ] Verify responsive behavior: department pills don't overflow card headers, header doesn't overflow on narrow screens

**No new files — edits across existing components.**

## Acceptance Criteria

### Functional Requirements

- [ ] Sidebar shows 6 use-case groups instead of 7 departments
- [ ] Clicking a use-case group shows prompts in that group's categories as card grid
- [ ] Category pills appear within group views and filter correctly
- [ ] Department filter dropdown appears in header with multi-select (OR logic)
- [ ] Department filter applies across all views: browse, search, favorites
- [ ] Department filter persists when switching sidebar groups
- [ ] Prompt cards show multiple department tags as pills
- [ ] Prompt cards show richer overview text (2-3 lines) with "Read more"
- [ ] "Read more" opens the prompt drawer
- [ ] Prompt table shows "Departments" column with multiple pills
- [ ] Prompt drawer shows full overview text and multiple department badges
- [ ] Detail view shows full overview and department badges
- [ ] Favorites view renders as cards (not table)
- [ ] Submit form has department pill toggles (multi-select), grouped category dropdown, overview textarea
- [ ] Submit form validates: at least 1 department, category required, overview required
- [ ] Search matches against overview text
- [ ] Search respects active department filter
- [ ] Pre-search state restoration includes group and department selections
- [ ] All 26+ mock prompts migrated with departments[], overview, and updated categoryIds

### Non-Functional Requirements

- [ ] No build errors or console warnings
- [ ] Dark and light modes both look correct for new elements
- [ ] Drawer scroll works correctly (min-h-0 pattern applied)
- [ ] Cards handle 1-4+ department tags without layout breakage

## Dependencies & Risks

| Risk | Mitigation |
|------|-----------|
| Mock data migration is tedious (26+ prompts) | Do it systematically — update types first, then batch-update prompts |
| Prop cascade touches many components | Phase the work: data model → App state → components top-down |
| Department pills overflow card headers | Cap visible pills at 2-3, show "+N more" overflow |
| Header gets crowded with new filter | Group search + filters with clear visual hierarchy |
| Category deduplication ambiguity | Use the mapping table in Phase 1 as source of truth |

## Sources & References

### Origin

- **Brainstorm document:** [docs/brainstorms/2026-03-31-remove-dept-silos-richer-summaries-brainstorm.md](../brainstorms/2026-03-31-remove-dept-silos-richer-summaries-brainstorm.md) — Key decisions: use-case groups replace departments in sidebar, departments become multi-select tags, richer overview replaces description, department filter in header

### Internal References

- **Prior UX fixes:** [docs/solutions/ui-bugs/prompt-library-prototype-build-and-ux-fixes.md](../solutions/ui-bugs/prompt-library-prototype-build-and-ux-fixes.md) — Critical patterns: flex+scroll (min-h-0), nav state restoration (preSearchState stash), card design (max 1 primary action)
- **Original prototype plan:** [docs/plans/2026-03-30-feat-prompt-library-prototype-plan.md](2026-03-30-feat-prompt-library-prototype-plan.md) — Original architecture and phase structure
