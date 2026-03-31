---
title: "fix: Prototype UX Issues from Review"
type: fix
status: active
date: 2026-03-30
origin: docs/plans/2026-03-30-feat-prompt-library-prototype-plan.md
---

# Fix Prototype UX Issues from Review

## Overview

Address 4 user-reported UX issues and 3 additional findings from code review of the prompt library prototype. All fixes are CSS/component-level changes — no new features, no new files.

## Findings Summary

- **4 user complaints** (drawer broken, card preview ugly, button confusion, submit incomplete)
- **3 additional issues** (theme FOUC, search context loss, duplicated code)

---

## Fix 1: Drawer Scroll + Heart/X Overlap (CRITICAL)

**Problem:** The right-side Sheet drawer content gets cut off and can't scroll. The heart (favorite) icon overlaps with shadcn's built-in X close button.

**Root cause:** Classic CSS flex-scroll trap. `ScrollArea` in a flex column needs `min-h-0` because flexbox `min-height` defaults to `auto` (content size), preventing the scroll viewport from constraining its height. Heart icon is in the SheetHeader which conflicts with the Sheet's own close button positioning.

**Fix:**

- [ ] `src/components/prompts/PromptDrawer.tsx` — Add `min-h-0` to the ScrollArea className: `"flex-1 mt-4 min-h-0"`
- [ ] `src/components/prompts/PromptDrawer.tsx` — Remove the heart icon from the SheetHeader (lines ~98-105) and move it to the footer action bar next to the Copy button
- [ ] `src/components/prompts/PromptDrawer.tsx` — Remove the VersionHistory conditional return that renders a second Sheet (causes state conflicts). Instead, show version history as an inline expandable section within the existing drawer's ScrollArea
- [ ] Delete `src/components/vision/VersionHistory.tsx` — inline the timeline content into PromptDrawer directly

**Files modified:**
- `src/components/prompts/PromptDrawer.tsx`
- `src/components/vision/VersionHistory.tsx` (deleted)

---

## Fix 2: Card Prompt Preview (HIGH)

**Problem:** Cards show a `<pre>` block with raw prompt text truncated at 150 chars + hardcoded "...". Shows `{{variable_name}}` syntax in monospace font that looks like a code dump and can't be used.

**Root cause:** The card already has `prompt.description` which explains what the prompt does in human-readable text. The raw prompt text preview adds zero value on a card — users need to open the drawer to use the prompt anyway.

**Fix:**

- [ ] `src/components/prompts/PromptCard.tsx` — Remove the `<pre>` block (lines ~78-80) that shows truncated raw prompt text. The description is the card preview.

**Files modified:**
- `src/components/prompts/PromptCard.tsx`

---

## Fix 3: Copy vs Use Button Confusion (HIGH)

**Problem:** Two buttons on every card: "Use" (opens drawer, same as clicking the card) and "Copy" (copies raw text with unfilled `{{variables}}`). User can't tell them apart.

**Root cause:** "Use" is redundant with the card click. "Copy" copies an unfilled template which is rarely useful. The drawer already has the correct copy behavior (copies filled text).

**Fix:**

- [ ] `src/components/prompts/PromptCard.tsx` — Remove the "Use" button entirely (it duplicates card click behavior)
- [ ] `src/components/prompts/PromptCard.tsx` — Only show "Copy" button on cards where `hasVariables === false` (prompts with no variables can be copied directly from the card). Cards with variables show no copy button — user clicks card to open drawer, fills variables, copies from there.
- [ ] `src/components/prompts/PromptTable.tsx` — Keep the Copy button in table rows (table rows don't have a "Use" button, just Copy, which is fine)

**Files modified:**
- `src/components/prompts/PromptCard.tsx`
- `src/components/prompts/PromptTable.tsx` (no change needed, already correct)

---

## Fix 4: Submit Form Cleanup (MEDIUM)

**Problem:** The submit form's category dropdown is uncontrolled (no state binding). The form shows a toast and discards input. Keep the form but fix the broken parts.

**Decision:** Keep the submit form as a vision feature. Don't add an admin dashboard yet.

**Fix:**

- [ ] `src/components/vision/SubmitPrompt.tsx` — Add state for the category select (`selectedCategory`) and wire the `value` and `onChange` props
- [ ] `src/components/vision/SubmitPrompt.tsx` — Add basic required field validation before allowing submit (title and promptText must be non-empty, team must be selected)
- [ ] Keep "Pending Review" badges on the 2 hardcoded pending prompts — they show the vision

**Files modified:**
- `src/components/vision/SubmitPrompt.tsx`

---

## Fix 5: Theme FOUC — Flash of Wrong Theme (MEDIUM)

**Problem:** Users with dark mode preference see a white flash on page load because the `dark` class is only added after React hydrates and the `useEffect` fires (after first paint).

**Fix:**

- [ ] `prompt-library/index.html` — Add an inline `<script>` before any CSS/bundle loads that synchronously reads localStorage and sets the `dark` class on `<html>` if needed
- [ ] `src/hooks/useTheme.ts` — Update the initial state to read from the existing DOM class rather than re-reading localStorage (keep them in sync)

**Files modified:**
- `prompt-library/index.html`
- `src/hooks/useTheme.ts`

---

## Fix 6: Search Destroys Navigation Context (MEDIUM)

**Problem:** When user searches from a team view (e.g., Engineering), the team/category selection is cleared. When they clear the search, they're dumped to "All Prompts" instead of returning to Engineering.

**Fix:**

- [ ] `src/App.tsx` — Save the pre-search navigation state (selectedTeam, selectedCategory, showFavorites) when entering search mode. Restore it when search is cleared.

**Files modified:**
- `src/App.tsx`

---

## Fix 7: Duplicated Code Cleanup (LOW)

**Problem:** `modelColors` map is defined identically in both PromptCard.tsx and PromptDrawer.tsx. Violation of DRY.

**Fix:**

- [ ] Create a shared constant at `src/lib/constants.ts` with the `modelColors` map
- [ ] Import from both PromptCard and PromptDrawer
- [ ] Inline the UsageStats component (it's a single `<span>`) — delete `src/components/vision/UsageStats.tsx`

**Files modified:**
- `src/lib/constants.ts` (new)
- `src/components/prompts/PromptCard.tsx`
- `src/components/prompts/PromptDrawer.tsx`
- `src/components/vision/UsageStats.tsx` (deleted)

---

## Execution Order

1. Fix 1 (Drawer) — most critical, blocks demo
2. Fix 2 (Card preview) — quick win, remove 3 lines
3. Fix 3 (Button confusion) — quick win, remove/simplify
4. Fix 7 (Shared constants) — do while touching PromptCard/PromptDrawer
5. Fix 5 (Theme FOUC) — quick, standalone
6. Fix 6 (Search context) — standalone state change
7. Fix 4 (Submit form) — least critical

## Acceptance Criteria

- [ ] Drawer scrolls fully — all content accessible including variable inputs and Copy button
- [ ] No overlap between heart icon and X close button
- [ ] Cards show description only, no raw prompt text preview
- [ ] Cards with variables: only clickable card body (no buttons). Cards without variables: single "Copy" button
- [ ] Dark mode has no white flash on page load
- [ ] Searching then clearing search restores previous team/category view
- [ ] Submit form category dropdown is controlled and validates required fields
- [ ] `npm run build` passes with zero errors
