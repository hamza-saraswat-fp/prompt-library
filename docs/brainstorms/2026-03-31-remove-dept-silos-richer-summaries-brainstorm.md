---
title: "Remove Department Silos & Richer Prompt Summaries"
type: brainstorm
status: active
date: 2026-03-31
origin: PM feedback on prototype v1
---

# Remove Department Silos & Richer Prompt Summaries

## What We're Building

Two connected changes to the Prompt Library's information architecture and prompt card design, based on PM feedback from the v1 prototype review:

### Change 1: Replace department-based navigation with use-case categories

**Current state:** The sidebar lists 7 departments (Sales, CS, Engineering, etc.) as the primary navigation axis. Categories are nested under departments. Prompts have a single `teamId`.

**New state:** The sidebar organizes prompts by **use-case categories** — broader, cross-team buckets like "Writing & Communication", "Analysis & Research", "Development & Technical", etc. Departments become **multi-select tags** on prompts rather than the primary axis. A single prompt can be tagged with multiple departments.

**Why:** The PM's core concern is inclusivity. A "Meeting Analysis" prompt created by Sales is equally useful for Account Management, Support, and Product. Department-first navigation creates silos and a sense of competition. The prompt library should feel like a shared company resource, not a collection of team-owned sections.

### Change 2: Richer prompt overview/summary on cards

**Current state:** Cards show a `description` field (1-2 sentences, 3-line clamp) explaining what the prompt does.

**New state:** The `description` field becomes a richer `overview`/`summary` — a few sentences covering what the prompt does, how it behaves, and when to use it. Cards display 2-3 lines with a "Read more" affordance to see the full overview before opening the detail drawer.

**Why:** Simple descriptions don't give enough context for users to evaluate a prompt's relevance — especially now that prompts aren't segmented by department. The richer summary helps users self-serve across teams.

---

## Why This Approach

### Use-case sidebar (hybrid of categories + use-case buckets)

We evaluated four approaches and landed on a **hybrid of category-based and use-case-based navigation**:

**Approach considered and rejected:**
- **Flat browse + filters only** — Too overwhelming with no browsing structure; users with no specific search term would bounce
- **Tag cloud / explore page** — Feels trendy but poor for repeat users who want consistent navigation

**Chosen approach:**
The sidebar presents **broad use-case groups** (5-7 buckets) as primary navigation, each containing specific **task categories** within them. This gives structure without department ownership.

**Proposed sidebar groups:**

| Use-Case Group | Example Categories |
|---|---|
| **Writing & Communication** | Email Drafts, Outreach, Messaging, Proposals, Social Media |
| **Analysis & Research** | Meeting Analysis, Competitive Analysis, Data Analysis, Market Research |
| **Customer Operations** | Ticket Response, Onboarding, Churn Prevention, Escalation, QBR Prep |
| **Development & Technical** | Code Review, Debugging, Documentation, Architecture, Test Cases |
| **Planning & Strategy** | PRDs, User Stories, Sprint Planning, Release Notes, Roadmaps |
| **Content & Marketing** | Blog Posts, Campaign Briefs, SEO, Social Copy |

Each prompt gets:
- **One primary category** (e.g., "Email Drafts") which maps to a use-case group
- **Multiple department tags** (e.g., [Sales, CS, Account Management]) — filterable but not the hierarchy
- **Model tags** (unchanged)

### Multi-tag departments

Departments become a **filter dimension**, not a navigation axis:
- Prompts can have **multiple department tags** (array, not single foreign key)
- A "Meeting Analysis" prompt gets tagged `[Sales, Product, CS]`
- Users can filter by department in the filter bar (e.g., "Show me prompts tagged for my team") but it's not the primary browse experience
- This supports the PM's vision: departments are inclusive labels, not exclusive silos

### Richer card summaries

Cards keep a compact footprint but gain depth:
- 2-3 line summary visible on the card surface (what it does + when to use it)
- "Read more" text/link that opens the detail drawer for the full overview
- The full overview in the drawer/detail view covers: what the prompt does, how it behaves, expected output style, and when to use it
- Data model: rename `description` → `overview` (or keep `description` but expand its content guidance)

---

## Key Decisions

| # | Decision | Details |
|---|----------|---------|
| 1 | **Sidebar = use-case groups, not departments** | 5-7 broad use-case buckets replace the 7 department entries. Each group contains specific task categories. |
| 2 | **Departments become multi-select tags** | `teamId: string` becomes `departments: string[]` on the Prompt type. Prompts can belong to multiple departments. |
| 3 | **Categories are global, not team-scoped** | Categories no longer have a `teamId`. They map to use-case groups instead. |
| 4 | **Department filter in header/filter bar** | Users can still filter by department, but it's a dropdown/pill filter — same level as model filter, not sidebar navigation. |
| 5 | **Card summary = 2-3 lines + "Read more"** | Cards show a truncated overview. Full overview available in drawer/detail view. |
| 6 | **Overview replaces description** | The `description` field in the data model gets richer content guidance — or we rename to `overview` for clarity. |
| 7 | **"All Prompts" remains the default landing** | Table view of all prompts, now with department tags as filterable badges instead of the primary grouping column. |

---

## Data Model Changes

### Current → New

**Prompt type:**
```
- teamId: string          → departments: string[]     (multi-select tags)
- categoryId: string      → categoryId: string        (now global, not team-scoped)
- description: string     → overview: string           (richer, 2-4 sentences)
```

**Team type → Department tag:**
```
- Team { id, name, icon, categories[] }  →  departments are just a string array
- Categories decouple from teams entirely
```

**Category type:**
```
- Category { id, name, teamId }  →  Category { id, name, groupId }
- groupId links to a use-case group (sidebar navigation bucket)
```

**New: UseCaseGroup type:**
```
UseCaseGroup { id, name, icon, categoryIds[] }
```

### Sidebar data flow

```
Current:  Sidebar → teams[] → team.categories[] → filter prompts by teamId + categoryId
New:      Sidebar → useCaseGroups[] → group.categories[] → filter prompts by categoryId
```

---

## Impact on Existing Components

| Component | Change |
|---|---|
| **Sidebar.tsx** | Replace team list with use-case group list. Remove team icons, add group icons. Keep "All Prompts", "My Favorites", "Submit" |
| **App.tsx** | Replace `selectedTeam` state with `selectedGroup`. Add `selectedDepartments: string[]` filter state. Update filter logic. |
| **PromptCard.tsx** | Show department tags as pills (multiple). Show richer overview with "Read more". Remove single team badge. |
| **PromptTable.tsx** | Replace "Team" column with "Departments" (show pills). |
| **PromptDrawer.tsx** | Show full overview text. Show department tags. |
| **PromptDetailView.tsx** | Show full overview. Show department tags. |
| **CategoryPills.tsx** | Categories now come from use-case group, not team. Logic change but UI similar. |
| **Header.tsx** | Add department filter dropdown (multi-select) alongside model filter. |
| **types.ts** | Update Prompt, Category interfaces. Add UseCaseGroup. Remove Team type (or repurpose). |
| **teams.ts** | Restructure into use-case groups + global categories + department list. |
| **prompts.ts** | Update all 26+ mock prompts: `teamId` → `departments[]`, `description` → `overview`, re-map `categoryId` to global categories. |

---

## Open Questions

_None — all key decisions resolved through collaborative dialogue._

---

## Out of Scope

- Backend/database changes (this is still a prototype with mock data)
- Search algorithm changes (still client-side keyword matching, but now searches overview text too)
- Bundle restructuring (bundles still work the same, just not team-scoped)
- Authentication or permissions changes
