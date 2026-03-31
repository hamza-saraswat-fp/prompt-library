# Prompt Library Prototype — Brainstorm

**Date:** 2026-03-30
**Status:** Draft
**Participants:** Hamza, Claude

---

## What We're Building

A high-fidelity prototype of FieldPulse's internal Prompt Library using React, Tailwind CSS, and shadcn/ui. No database — all client-side with hardcoded mock data. The goal is to nail the UI/UX before building any real functionality.

**Scope:** Full vision mockup — includes visual representations of Must Have, Should Have, and Could Have features from the PRD. Non-functional features should be clickable with static/mock data to feel real during stakeholder demos.

**Audience for the prototype:** Stakeholders/PM for buy-in, then later the 200+ FieldPulse employees (Sales, CS, Implementation, Engineering, Product, Marketing, QA) with varying technical literacy.

---

## Why This Approach

The manager's directive is clear: React + Tailwind + shadcn, focus on UI/UX, no database. This is a stakeholder alignment tool — get agreement on what the product looks and feels like before investing in backend work.

Three reference products were researched to ground the design in proven patterns:
- **Langfuse** — developer-oriented prompt management with version labels, variable detection, side-by-side comparison, and a playground
- **Egnyte** — enterprise prompt library with tab-based task categories (Understand, Create, Ask, Analyze), job type filtering, and a Trending Now section
- **Vellum AI** — IDE-style prompt editor with Rich Text Blocks, `{{` variable dropdown trigger, and scenarios for testing

Rather than copying one product wholesale, we're blending the best patterns from each into something tailored for FieldPulse's non-technical-heavy user base.

---

## Key Decisions

### 1. Layout: Sidebar + Content Area
- **Collapsible sidebar** organized by Team (Sales, CS, Implementation, Engineering, Product, Marketing, QA) as primary navigation
- Matches the PRD's Information Architecture exactly
- Global search bar at the top of the content area

### 2. Browse Experience: Hybrid Cards + Table
- **Card grid** when browsing a specific team's section (fewer items, discovery-focused, more visual and approachable for non-technical users)
- **Table/list view** for the "All Prompts" filterable view (higher density, power-user oriented)
- Neither Langfuse, Egnyte, nor Vellum use cards — but cards match the "Prompt Card" component spec and are better for the target audience

### 3. Filtering: Layered Separation
- **Sidebar** = Team navigation (primary)
- **Horizontal pills/tabs** above content = Category filters (Email Draft, Code Review, Onboarding, etc.)
- **Dropdown** in top bar = Model filter (ChatGPT, Claude, Gemini, Model-Agnostic)
- Inspired by Egnyte's task category tabs + job type filter pattern, adapted for FieldPulse's taxonomy

### 4. Prompt Card Component
- **Header:** Title + Model tag (pill badge) + Team tag
- **Body:** Short description + truncated preview of prompt text
- **Footer/Actions:** Primary "Copy to Clipboard" button + secondary "Use Prompt" button (opens variable fill-in if applicable)
- **Vision indicators:** Version badge (e.g., "v3"), copy count, "Trending" badge on popular prompts

### 5. Variable Fill-In: Side Drawer (Right Panel)
- When user clicks "Use Prompt" on a prompt with `{{variables}}`:
  - A **right-side drawer** slides in (shadcn Sheet component)
  - Left side shows the full prompt text with variables highlighted
  - Right drawer shows input fields auto-generated from detected `{{variable}}` placeholders
  - Prompt text updates in **real-time** as user fills in variables (Langfuse playground pattern)
  - "Copy Filled Prompt" button at the bottom of the drawer
- Inspired by Langfuse's variable detection + playground feel

### 6. Full Vision Elements (Clickable but Static)
These features won't have real functionality but will be clickable with mock data:
- **Version History:** Clicking opens a drawer showing fake version entries with dates, authors, and diff indicators
- **Usage Analytics:** A static mini-chart or number showing "Copied 47 times this week"
- **Submission Workflow:** "Submit New Prompt" button opens a form; "Pending Review" status tag on submitted prompts
- **Prompt Bundles:** Visual grouping of related prompts (e.g., "New Customer Onboarding" = 5 prompts shown as a set)
- **Favorites:** Heart/bookmark icon on cards, "My Favorites" section in sidebar
- **Trending/Popular badges:** "Trending Now" badge on high-usage prompt cards (Egnyte pattern)

### 7. Tech Stack
- **React** (Vite for fast dev)
- **Tailwind CSS** for styling
- **shadcn/ui** for components (Sheet, Popover, Command, Badge, Card, Table, etc.)
- **No database** — hardcoded JSON mock data representing prompts for each team
- **Client-side only** — copy to clipboard works, everything else is visual

---

## Reference Pattern Mapping

| FieldPulse Feature | Inspired By | Adaptation |
|---|---|---|
| Team sidebar navigation | Egnyte's job type categorization | Promoted to primary sidebar nav instead of dropdown filter |
| Category pills | Egnyte's task category tabs (Understand, Create, Ask, Analyze) | Changed to FieldPulse-specific categories (Email Draft, Code Review, etc.) |
| Variable fill-in drawer | Langfuse's playground + variable detection | Side drawer with real-time preview instead of full playground |
| `{{variable}}` syntax | All three (Langfuse, Egnyte, Vellum) | Standard mustache syntax, auto-detected to generate form fields |
| Version badges | Langfuse's production/staging labels | Simplified to version number badge on cards |
| Trending badges | Egnyte's "Trending Now" category | Badge on individual cards rather than separate section |
| Prompt card layout | Custom (none of the three use cards) | Better for non-technical audience; more visual than table rows |
| Model tags | PRD requirement | Colored pill badges (ChatGPT=green, Claude=orange, Gemini=blue, Agnostic=gray) |

---

## Mock Data Plan

The prototype needs realistic prompts for at least 3-4 teams to feel real in demos:
- **Sales:** 5-8 prompts (outreach emails, objection handling, proposals)
- **Customer Success:** 5-8 prompts (ticket responses, onboarding scripts, churn prevention)
- **Engineering:** 3-5 prompts (code review, documentation, debugging)
- **Product:** 3-5 prompts (PRDs, user stories, release notes)
- Some prompts should have `{{variables}}` to demonstrate the fill-in flow
- Some should be marked as "Trending" or have high copy counts
- Include at least one "Prompt Bundle" group

---

## Resolved Questions

1. **Home/landing page:** Users land directly on the "All Prompts" view — no separate dashboard. Simpler, no extra page to maintain. Team sidebar is always visible for navigation.

2. **Prompt detail view:** Expanded card + side drawer. No full-page detail view. Clicking a card expands it or opens a drawer with full prompt text, variable fill-in, and vision elements (version history, usage stats). Keeps interactions fast with no page navigation.

3. **Dark mode:** Yes, include a dark mode toggle. Easy with Tailwind's `dark:` classes and shadcn's built-in dark mode support. Looks polished in demos.

4. **Demo audience:** PM/manager for internal review. Mock data can be representative but doesn't need to be production-quality. Should still feel realistic enough to evaluate UI/UX decisions.

## Open Questions

None — all key decisions resolved.
