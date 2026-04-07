# FieldPulse Skills Library — Brainstorm

**Date:** 2026-04-06
**Author:** Hamza Saraswat
**Status:** Brainstorm / Concept
**Related:** [Master Plan](2026-04-02-functional-prompt-library-master-plan.md) | [MVP Plan](2026-04-06-mvp-plan.md)

---

## What Is a Skill?

A skill is a reusable set of instructions that shapes how an AI behaves for a specific job or workflow. Unlike a prompt (which is a one-shot task — "write me an email"), a skill gives the AI a persistent role, context, and set of rules that it follows throughout an entire conversation or session.

**Prompt:** "Write a cold outreach email to an HVAC business owner."
**Skill:** "You are a FieldPulse sales coach. You know our pricing, competitors, and value props for field service businesses. When I describe a prospect, help me craft the right approach — tone, objection handling, and follow-up strategy."

A skill is what you load *before* you start working. A prompt is what you use *while* working.

### Where Skills Can Be Used

Skills are platform-agnostic — they work anywhere you can give an AI instructions:

| Platform | How to load a skill |
|---|---|
| **Claude Projects** | Paste as "Project Instructions" — persists across all conversations in that project |
| **ChatGPT Custom Instructions / GPTs** | Paste into custom instructions or use as a Custom GPT system prompt |
| **Gemini Gems** | Create a Gem with the skill as its instructions |
| **Cowork / AI assistants** | Load as agent behavior definitions |
| **Claude Code** | Save as a `SKILL.md` file — auto-loads when relevant |
| **Cursor / Windsurf** | Save as `.cursorrules` or project instructions |
| **Any chat AI** | Paste the skill as the first message to set behavior for the session |

The library stores the skill content and tells users how to load it into their tool of choice.

---

## How Skills Fit Into the Library

### Separate but Cross-Linked

Skills live in their own section of the library (accessible via a "Skills" tab in the sidebar), but are cross-referenced with prompts:

- A **prompt card** can show "Works well with: Sales Coach skill" linking to the related skill
- A **skill page** lists "Recommended prompts" that pair well with it
- **Bundles** can contain both prompts and skills as a complete workflow package (e.g., the "Customer Onboarding Bundle" could include the "Implementation Playbook" skill + 3 onboarding prompts)

### Skills vs Prompts at a Glance

| | Prompt | Skill |
|---|---|---|
| **Purpose** | Get a specific output | Shape ongoing AI behavior |
| **Length** | Short (50-500 words) | Longer (200-2000 words) |
| **Usage** | Copy → paste → get result | Load once → use throughout session |
| **Variables** | Yes (fill in blanks) | Optional (some have configurable sections) |
| **Lifespan** | One-shot | Persistent for a session or project |
| **Example** | "Write a follow-up email" | "You are a CS specialist who writes in our brand voice" |

---

## Example FieldPulse Skills

### Sales Coach
> **Tags:** Sales, Customer-Facing
> **Best for:** Claude Projects, ChatGPT Custom Instructions

Gives the AI deep knowledge of FieldPulse's value props, pricing tiers, common objections, and competitor positioning for field service businesses. Every response is framed as actionable sales coaching. Knows the difference between selling to a 5-person plumbing shop vs a 50-person HVAC company.

**Pairs with prompts:** Cold Outreach Email, Objection Handler, Proposal Executive Summary

---

### CS Tone & Voice
> **Tags:** Customer Success, Customer-Facing
> **Best for:** Any AI tool used for customer communication

Defines FieldPulse's customer success writing voice — empathetic, solution-oriented, avoids technical jargon, always offers a clear next step. The AI follows these guidelines for every response, whether it's drafting a ticket response, writing a check-in email, or preparing QBR talking points.

**Pairs with prompts:** Ticket Response, Churn Risk Outreach, QBR Prep Summary

---

### FieldPulse Product Expert
> **Tags:** Product, Customer Success, Implementation
> **Best for:** Claude Projects, Gemini Gems

Deep context about FieldPulse features, integrations, limitations, and known workarounds. The AI becomes a knowledgeable product specialist that can answer customer questions accurately, draft help articles, or support implementation conversations without hallucinating features that don't exist.

**Pairs with prompts:** Customer Setup Checklist, Data Migration Guide

---

### Bug Report Writer
> **Tags:** QA, Engineering, Internal
> **Best for:** Claude Code, Cursor

Instructions that enforce FieldPulse's bug report format — structured reproduction steps, expected vs actual behavior, environment details, severity classification. The AI asks clarifying questions when information is missing and auto-categorizes issues based on the description.

**Pairs with prompts:** Bug Report Template, Test Case Generator

---

### Implementation Playbook
> **Tags:** Implementation, Onboarding, Customer-Facing
> **Best for:** Claude Projects, ChatGPT

A step-by-step skill that walks through FieldPulse customer onboarding. It knows the phases (Day 1, Week 1, Week 2), asks the right discovery questions at each stage, generates setup checklists tailored to the customer's industry and team size, and drafts all the communication touchpoints.

**Pairs with prompts:** Onboarding Welcome Email, Onboarding Check-In, Onboarding Completion Summary

---

## UI & User Experience

### Skill Card (Browse View)

Similar to prompt cards but with a distinct visual treatment:

- **"Skill" badge** in the header (different color from prompt tags — e.g., amber/gold)
- **Title** — e.g., "Sales Coach"
- **Description** — 2-3 line overview of what the skill does
- **Tags** — same tag system as prompts (blue department, purple workflow)
- **Platform icons** — small icons showing which AI tools the skill is optimized for (Claude, ChatGPT, Gemini, etc.)
- **"Pairs with" count** — e.g., "3 related prompts"
- **Author + last updated**
- No copy button on the card (skills are too long for quick copy — users need to open the detail view)

### Skill Detail Page (`/skills/:id`)

The full skill page with:

- **Title + description + tags + platform icons**
- **"How to use this skill"** — collapsible section with step-by-step instructions for each platform (Claude, ChatGPT, Gemini, etc.)
- **Skill content** — the full instruction text, syntax-highlighted in a code block (similar to how prompts display)
- **Copy button** — copies the full skill text to clipboard (same split button pattern: Copy + Open in ChatGPT/Claude/Gemini)
- **"Pairs well with" section** — linked prompt cards that work well with this skill
- **Comments & feedback** — same comment system as prompts
- **Version history** — same version tracking as prompts
- **Shareable URL** — `/skills/:id` for linking and sharing

### Sidebar Navigation

Add a "Skills" section to the sidebar:

```
All Prompts
  Writing & Communication
  Analysis & Research
  Customer Operations
  Development & Technical
  Planning & Strategy
  Content & Marketing
Skills            ← new
  Browse All Skills
  By Department
My Favorites
```

### Search

Skills are included in search results alongside prompts. Search results show a badge ("Prompt" or "Skill") so users can distinguish them. Tag filtering works the same way across both content types.

---

## Backend & Data Model

### New Supabase Tables

**`skills` table**
Stores the skill content — mirrors the `prompts` table structure for consistency.

| What it stores |
|---|
| id, title, description (short overview), skill_text (the full instruction content), author_id, version, category_id, created_at, updated_at |

**`skill_tags`** — Many-to-many join linking skills to the same tags table that prompts use. No separate tag system needed.

**`skill_variables`** — Optional configurable sections within a skill (e.g., "Replace {{company_name}} with your company" sections).

**`skill_platforms`** — Which AI platforms the skill is optimized for (Claude, ChatGPT, Gemini, Cursor, etc.). Drives the platform icons on the card.

**`skill_prompt_links`** — Cross-reference table linking skills to related prompts (and vice versa). Powers the "Pairs well with" section.

**`skill_comments`** — Same structure as prompt comments (id, skill_id, author_id, text, created_at).

**`skill_version_history`** — Same structure as prompt version history (id, skill_id, version, author_id, change_description, skill_text_snapshot, created_at).

**`skill_analytics`** — Same structure as prompt analytics (id, skill_id, user_id, action, created_at). Actions: "copy", "view", "open_chatgpt", "open_claude", "open_gemini".

### Existing Tables (No Changes)

These tables are shared between prompts and skills:
- **`tags`** — Skills use the same tags as prompts
- **`profiles`** — Same user/admin system
- **`categories`** — Skills can optionally use the same categories, or we can add skill-specific categories later

### Bundles Update

The existing `bundles` and `bundle_prompts` tables need a small extension to support mixed content:

**`bundle_items`** (replaces `bundle_prompts`)

| What it stores |
|---|
| bundle_id, item_id, item_type ("prompt" or "skill"), sort_order |

This lets a bundle contain both prompts and skills in any order.

---

## Admin Dashboard (Skills Management)

Extends the existing admin dashboard with:

- **Skills table** — Full list of all skills with title, author, tags, platform, status, last updated. Click to edit.
- **Skill editor** — Create or edit a skill: title, description, full skill text, tags, platform compatibility, linked prompts. Markdown preview for the skill content.
- **Submission queue** — Same approval workflow as prompts. Users submit skills, admins approve/reject.
- **Cross-link manager** — UI to link skills to related prompts (and vice versa).

---

## Phased Rollout

### Phase 1: Foundation (Ship with MVP or shortly after)
- `skills` table + basic CRUD in admin dashboard
- Skill detail page with copy button
- Sidebar "Skills" section with browse
- Skills in search results
- 5-10 seed skills authored by the team

### Phase 2: Cross-Linking & Discovery
- Skill ↔ prompt cross-references ("Pairs well with")
- Mixed bundles (prompts + skills)
- Platform compatibility icons
- "How to use" instructions per platform

### Phase 3: Advanced
- Skill analytics (copies, views, platform usage)
- Skill effectiveness tracking
- AI-recommended skill + prompt pairings
- Skill templates (generate a new skill from a template)

---

## Open Questions

1. **Who authors skills?** — Admin-only, or can users submit skills for review like prompts?
2. **Skill length limits?** — Should there be a max character count? Some skills could be very long.
3. **Platform-specific versions?** — Should a skill have slightly different versions for different platforms (e.g., a Claude version vs ChatGPT version), or one universal text?
4. **Download as file?** — For Claude Code users, should there be a "Download as SKILL.md" button?
