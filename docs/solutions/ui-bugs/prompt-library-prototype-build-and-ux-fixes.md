---
title: "Prompt Library Prototype: Phased Build + UX Fix Pass"
date: 2026-03-30
category: ui-bugs
tags:
  - React
  - Tailwind CSS v4
  - shadcn/ui
  - TypeScript
  - Vite
  - CSS flexbox
  - dark mode
  - localStorage
  - variable templating
  - prototype
modules:
  - PromptDrawer
  - PromptCard
  - PromptTable
  - Sidebar
  - Header
  - AppShell
  - SubmitPrompt
  - PromptBundle
  - useTheme
  - useFavorites
severity: medium
---

# Prompt Library Prototype: Phased Build + UX Fix Pass

## Problem Summary

Built a high-fidelity prototype of FieldPulse's internal Prompt Library (React + Tailwind v4 + shadcn/ui, no backend). The initial 8-phase build produced a working prototype, but user review revealed 4 UX issues and code review found 3 more. A second fix pass resolved all 7.

## Phase 1: Initial Build (8 Phases)

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Hybrid browse: cards + table** | Card grid for team browsing (discovery), table for All Prompts (density). View switches automatically based on context. |
| **Right-side drawer for variable fill-in** | Sheet stays in context, real-time preview as user types. No page navigation. |
| **Layered filtering: Sidebar → Pills → Dropdown** | Team in sidebar (primary), category pills above content (team-specific), model dropdown in header (global). |
| **No routing library** | Single-page with state-driven views. Keeps prototype simple. |
| **localStorage for favorites + theme** | Survives page refresh without a backend. |
| **All 7 teams with mock data** | 26 prompts across Sales, CS, Implementation, Engineering, Product, Marketing, QA. Prevents empty teams during demos. |

### Tech Stack Setup (Tailwind v4 + shadcn/ui)

Tailwind v4 has breaking changes from v3:
- No `tailwind.config.js` — theme via `@theme {}` blocks in CSS
- CSS entry: `@import "tailwindcss"` (not `@tailwind base/components/utilities`)
- Vite plugin: `@tailwindcss/vite` (not PostCSS)
- Buttons default to `cursor: default` — add `cursor-pointer` explicitly
- shadcn `components.json` must have empty `tailwind.config` field

```bash
# Setup sequence
npm create vite@latest prompt-library -- --template react-ts
npm install
npm install -D tailwindcss @tailwindcss/vite @types/node
npx shadcn@latest init
npx shadcn@latest add sheet card table badge command popover tabs button input dialog tooltip dropdown-menu scroll-area separator sonner
```

### Variable Substitution System

Three utilities in `src/lib/variables.ts`:

```typescript
extractVariables(text)       // "Hello {{name}}" → ["name"]
fillVariables(text, values)  // "Hello {{name}}", {name: "Jo"} → "Hello Jo"
variableToLabel(name)        // "customer_name" → "Customer Name"
```

Unfilled variables remain as `{{variable_name}}` in copied text — safe for users to fill manually later.

---

## Phase 2: UX Fix Pass (7 Fixes)

### Fix 1: Drawer Scroll Broken (CRITICAL)

**Symptom:** Content cut off, can't scroll to variable inputs. Heart icon overlaps X close button.

**Root cause:** CSS flex-scroll trap. In a `flex flex-col` container, `min-height` defaults to `auto` (content size). ScrollArea's viewport grows to fit all content and never triggers overflow. Content gets clipped by `overflow-hidden` on the Sheet.

**Fix:**

```tsx
// BEFORE — ScrollArea doesn't scroll
<ScrollArea className="flex-1 mt-4">

// AFTER — min-h-0 allows flex shrink below content size
<ScrollArea className="flex-1 mt-4 min-h-0">
```

**Pattern for future Sheet/Drawer components:**
```tsx
<SheetContent className="overflow-hidden flex flex-col">
  <SheetHeader className="shrink-0">Fixed header</SheetHeader>
  <ScrollArea className="flex-1 min-h-0">Scrollable content</ScrollArea>
  <Footer className="shrink-0 border-t">Fixed footer</Footer>
</SheetContent>
```

Heart icon moved from SheetHeader (overlapped close button) to footer action bar (next to Copy button).

Version history changed from a separate Sheet component (caused state conflicts with two Sheets sharing `open` state) to an inline expandable section with toggle chevron.

---

### Fix 2: Card Shows Ugly Raw Prompt Text (HIGH)

**Symptom:** Cards displayed raw `{{variable_name}}` syntax in monospace, truncated at 150 chars with hardcoded "...".

**Root cause:** Cards already have `prompt.description` (human-readable). The raw prompt text preview was redundant.

**Fix:** Removed the `<pre>` block entirely. Cards now show description only (3-line clamp). Full prompt text is in the drawer where it belongs.

---

### Fix 3: Copy vs Use Buttons Confusing (HIGH)

**Symptom:** Two buttons — "Use" (opens drawer) and "Copy" (copies raw unfilled text). Users couldn't tell them apart.

**Root cause:** "Use" duplicated the card click behavior. Copying unfilled `{{variables}}` is rarely useful.

**Fix:**
- Removed "Use" button entirely (card click opens drawer)
- "Copy" only appears on cards without variables
- Cards with variables: click card → drawer → fill variables → copy from drawer

---

### Fix 4: Submit Form Uncontrolled (MEDIUM)

**Symptom:** Category dropdown had no state binding. Form submitted with empty required fields.

**Fix:** Added `categoryId` state with `value`/`onChange` bindings. Added `canSubmit` validation gate requiring title + promptText + teamId. Submit button disabled when invalid.

---

### Fix 5: Theme FOUC — White Flash (MEDIUM)

**Symptom:** Dark mode users saw a white flash on page load.

**Root cause:** React's `useEffect` fires after first paint. The `dark` class wasn't set until hydration completed.

**Fix:** Inline synchronous `<script>` in `<head>` of `index.html`:

```html
<script>
  (function() {
    var saved = localStorage.getItem("theme");
    var isDark = saved ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDark) document.documentElement.classList.add("dark");
  })();
</script>
```

Runs before CSS loads, no flash.

---

### Fix 6: Search Destroys Navigation Context (MEDIUM)

**Symptom:** User in Engineering team searches, clears search, lands on "All Prompts" instead of returning to Engineering.

**Root cause:** Search cleared `selectedTeam`/`selectedCategory` with no mechanism to restore.

**Fix:** Stash/restore pattern:

```typescript
const [preSearchState, setPreSearchState] = useState(null)

const handleSearch = (query: string) => {
  if (query && !searchQuery) {
    setPreSearchState({ selectedTeam, selectedCategory, showFavorites })
  }
  setSearchQuery(query)
  if (query) {
    setSelectedTeam(null) // clear for global search
  } else if (preSearchState) {
    setSelectedTeam(preSearchState.selectedTeam) // restore on clear
    setPreSearchState(null)
  }
}
```

---

### Fix 7: Duplicated Constants (LOW)

**Fix:** Extracted `modelColors` map to `src/lib/constants.ts`. Deleted `VersionHistory.tsx` (inlined) and `UsageStats.tsx` (was a single `<span>`).

---

## Prevention Checklist

### Flex + Scroll Layouts
- [ ] Every `flex flex-col` with a scrollable child: add `min-h-0` to the scrollable element
- [ ] Test drawer/sheet scroll on mobile viewport (375px)
- [ ] Never nest two Sheet components sharing the same `open` state

### Theme
- [ ] Theme init script in `<head>`, synchronous, before CSS loads
- [ ] Test with hard refresh (not just HMR)
- [ ] Fallback to `prefers-color-scheme` when no localStorage value

### Cards & Actions
- [ ] Max 1 action button per card (the primary action)
- [ ] Don't show raw data on cards — use human-readable descriptions
- [ ] Copy button only when the copy result is immediately useful

### Forms
- [ ] Every `<select>`, `<input>`, `<textarea>` must be controlled (value + onChange)
- [ ] Validate required fields before enabling submit

### Navigation State
- [ ] If a feature clears navigation state (search, filter reset), implement restore-on-clear
- [ ] Test: enter feature → exit feature → user should return to previous context

---

## Cross-References

- **PRD:** `prompt_library_product_brief.md` — MoSCoW prioritization, Information Architecture
- **Brainstorm:** `docs/brainstorms/2026-03-30-prompt-library-prototype-brainstorm.md` — Design decisions, reference patterns (Langfuse, Egnyte, Vellum)
- **Build plan:** `docs/plans/2026-03-30-feat-prompt-library-prototype-plan.md` — 8-phase implementation
- **Fix plan:** `docs/plans/2026-03-30-fix-prototype-ux-issues-plan.md` — 7 UX fixes
- **External patterns:** Langfuse (variable playground), Egnyte (category tabs), Vellum (variable detection)
