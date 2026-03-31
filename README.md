# FieldPulse Prompt Library

An internal web application for FieldPulse employees to discover, use, and share AI prompts across teams. Built as a high-fidelity prototype to validate UI/UX before backend investment.

## Why

FieldPulse has 200+ employees across seven departments using AI tools (ChatGPT, Gemini, Claude) with zero standardization. There's no shared system for storing, organizing, or discovering prompts — every employee starts from scratch. This prototype validates the concept of a centralized Prompt Library that reduces duplication, accelerates onboarding, and builds institutional AI knowledge.

## Features

- **Team-based browsing** — Dedicated sections for Sales, Customer Success, Implementation, Engineering, Product, Marketing, and QA
- **Hybrid browse experience** — Card grid for team views, sortable table for "All Prompts"
- **Variable fill-in** — Prompts with `{{placeholders}}` get an interactive fill-in drawer with real-time preview
- **One-click copy** — Copy prompt text (with or without filled variables) to clipboard
- **Global search** — Real-time keyword search across titles, descriptions, and prompt text
- **Layered filtering** — Category pills + AI model dropdown
- **Favorites** — Bookmark prompts to a personal quick-access list (persisted to localStorage)
- **Prompt bundles** — Related prompts grouped together (e.g., "New Customer Onboarding")
- **Dark mode** — Toggle with preference persisted to localStorage
- **Collapsible sidebar** — Full or icon-only navigation
- **Vision features** — Clickable-but-static representations of version history, submission workflow, and usage stats

## Tech Stack

- **React 19** + **TypeScript** via **Vite 7**
- **Tailwind CSS v4** (`@tailwindcss/vite` plugin, no config file)
- **shadcn/ui** component library
- **Sonner** for toast notifications
- **Lucide React** for icons
- Client-side only — no backend, no database, hardcoded mock data

## Getting Started

```bash
cd prompt-library
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Project Structure

```
prompt-library/          # React application
├── src/
│   ├── components/
│   │   ├── ui/          # shadcn/ui components
│   │   ├── layout/      # AppShell, Sidebar, Header
│   │   ├── prompts/     # PromptCard, PromptTable, PromptDrawer, etc.
│   │   └── vision/      # Static vision features (SubmitPrompt, etc.)
│   ├── data/            # Mock data and TypeScript types
│   ├── hooks/           # useTheme, useFavorites
│   └── lib/             # Utilities (cn(), variable parsing)
docs/                    # Brainstorms and implementation plans
prompt_library_product_brief.md  # Full product brief / PRD
```

## Prototype Scope

This is a **UI/UX prototype** for stakeholder validation. The only functional interaction is copy-to-clipboard. All other features (submission, versioning, analytics) are visual representations with static data.

## Related Docs

- [Product Brief](prompt_library_product_brief.md) — Full PRD with MoSCoW prioritization
- [Implementation Plan](docs/plans/2026-03-30-feat-prompt-library-prototype-plan.md) — Technical approach and architecture
- [Brainstorm](docs/brainstorms/2026-03-30-prompt-library-prototype-brainstorm.md) — Design decisions and exploration
