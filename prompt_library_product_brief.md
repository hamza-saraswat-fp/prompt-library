# FieldPulse Prompt Library — Product Brief

## Problem Statement

FieldPulse has 200+ employees across seven departments, all using AI tools — ChatGPT, Gemini, Claude, and others — with zero standardization. There is no shared system for storing, organizing, or discovering prompts. Every employee starts from scratch each time they interact with an AI model, frequently re-providing the same FieldPulse-specific context (customer types, product features, internal workflows). When someone crafts an effective prompt, that knowledge stays locked in their personal chat history. There is no mechanism for cross-team learning, no way to identify what's working, and no baseline for AI-assisted productivity.

---

## Vision

A single internal web application where any FieldPulse employee can find, use, and contribute AI prompts — organized by team and use case. The Prompt Library becomes the central hub for institutional AI knowledge, reducing duplication, accelerating onboarding, and enabling every department to leverage AI effectively regardless of individual technical skill level.

**Core value proposition:**
- Reduce time-to-value with AI across all departments
- Build institutional AI knowledge that compounds over time
- Give every employee — from the most technical engineer to the newest sales rep — a starting point for working with AI

---

## Jobs To Be Done

| # | Job Statement |
|---|---------------|
| 1 | When I need to use AI for a task, I want to find a proven prompt so I don't start from scratch every time. |
| 2 | When I create a prompt that works well, I want to share it with my team so others can benefit from it. |
| 3 | When I'm new to using AI (or new to FieldPulse), I want curated starting points so I can be productive immediately. |
| 4 | When I manage a team, I want to see how my team is using AI so I can identify and standardize best practices. |
| 5 | When I use a shared prompt, I want to plug in my specific details (customer name, issue type, etc.) so it works for my situation without manual editing. |
| 6 | When I'm looking for a prompt, I want to filter by my team, the AI model I use, and the type of task so I can find what I need quickly. |

---

## Target Users and Teams

| Team | Likely Prompt Categories |
|------|------------------------|
| **Sales** | Outreach emails, objection handling, proposal drafts, lead qualification, competitor comparisons |
| **Customer Success** | Ticket responses, onboarding scripts, escalation templates, churn prevention, check-in messaging |
| **Implementation** | Setup guides, configuration walkthroughs, training materials, migration checklists |
| **Engineering** | Code review, documentation generation, debugging assistance, architecture decisions |
| **Product** | PRDs, user stories, competitive analysis, feature specifications, release notes |
| **Marketing** | Content drafts, social media copy, campaign briefs, SEO optimization, blog outlines |
| **QA** | Test case generation, bug report templates, regression checklists, test plan creation |

---

## MoSCoW Prioritization

### Must Have
*MVP — the product does not launch without these.*

| Feature | Description |
|---------|-------------|
| **Prompt storage** | Each prompt has a title, description, and the full prompt text |
| **Team-based organization** | Every team has its own dedicated section; this is the primary navigation |
| **Category tagging** | Prompts are tagged with categories within each team (e.g., Sales → Outreach, Sales → Objection Handling) |
| **One-click copy** | A single button copies the full prompt text to clipboard, ready to paste into any AI tool |
| **Model tagging** | Each prompt is tagged with which AI model it's designed for: ChatGPT, Claude, Gemini, or Model-Agnostic |
| **Search** | Keyword search across prompt titles, descriptions, and tags |
| **Variable placeholders** | Prompts can include fillable variables (e.g., `{{customer_name}}`, `{{issue_type}}`) with a simple fill-in UI before copying |
| **User authentication** | Basic auth via company SSO so access is limited to FieldPulse employees |

### Should Have
*High value — planned for fast follow after MVP.*

| Feature | Description |
|---------|-------------|
| **Prompt versioning** | Edit history so users can see what changed and revert if needed |
| **Usage analytics** | Track which prompts are copied most often, broken down by team |
| **Favorites / bookmarks** | Users can save frequently-used prompts to a personal quick-access list |
| **Suggested prompts** | Surface popular or relevant prompts when browsing a team's section |
| **Rich filtering** | Filter by model, team, category, and popularity in a combined view |
| **Submission workflow** | Anyone can submit a prompt; team leads review and approve before it goes live |
| **Prompt bundles** | Group related prompts together (e.g., "New Customer Onboarding" = 5 related prompts as a set) |

### Could Have
*Nice to have — future consideration based on adoption and feedback.*

| Feature | Description |
|---------|-------------|
| **Rating / upvoting** | Users can upvote prompts to surface the best ones organically |
| **Comments and tips** | Users can leave notes on prompts (e.g., "works better if you add X") |
| **Personal prompt drafts** | Private workspace for drafting prompts before submitting to the team |
| **Chrome extension** | Quick-access popup to search and copy prompts from any browser tab |
| **Slack integration** | Search and surface prompts directly from Slack |
| **Output examples** | Show a sample AI output alongside the prompt so users know what to expect |
| **AI-assisted improvement** | Suggest refinements to prompt wording for clarity or effectiveness |
| **Featured prompt of the week** | Cross-team highlight to drive discovery and engagement |

### Won't Have
*Explicitly out of scope for this initiative.*

| Feature | Rationale |
|---------|-----------|
| **Direct AI model integration** | No "run this prompt" button — copy/paste into the user's preferred tool is sufficient |
| **Customer-facing prompt library** | This is an internal tool; no external access |
| **Automated prompt evaluation** | No automated testing of prompt quality or output scoring |
| **Multi-tenant capabilities** | Single-tenant internal tool only |
| **Usage-based billing or access control** | All employees get equal access |
| **Integration with FieldPulse core product** | The prompt library is a standalone tool, not embedded in the product |

---

## Information Architecture

```
Home
├── Search (global, always accessible)
├── Browse by Team
│   ├── Sales
│   │   ├── Outreach
│   │   ├── Objection Handling
│   │   ├── Proposals
│   │   └── ...
│   ├── Customer Success
│   │   ├── Ticket Responses
│   │   ├── Onboarding
│   │   └── ...
│   ├── Implementation
│   ├── Engineering
│   ├── Product
│   ├── Marketing
│   └── QA
├── All Prompts (filterable list view)
└── My Favorites (personal bookmarks)
```

**Prompt Card (individual prompt view):**
- Title
- Description (what this prompt does and when to use it)
- Full prompt text (with variable placeholders highlighted)
- Model tag(s)
- Team and category tags
- Copy button (primary action)
- Variable fill-in fields (if applicable)

---

## Tagging Taxonomy

| Tag Type | Required? | Values |
|----------|-----------|--------|
| **Team** | Yes | Sales, CS, Implementation, Engineering, Product, Marketing, QA |
| **Category** | Yes | Task-specific (e.g., Email Draft, Code Review, Bug Report, PRD) |
| **Model** | Yes | ChatGPT, Claude, Gemini, Model-Agnostic |
| **Use Case** | No | More specific context (e.g., Customer Onboarding, Sprint Planning) |
| **Difficulty** | No | Beginner, Intermediate, Advanced |

---

## Success Metrics

| Metric | What It Measures |
|--------|-----------------|
| Prompts contributed per team | Adoption and engagement across departments |
| Prompt copies per week | Active usage and value delivery |
| % of employees with at least one session | Reach and awareness |
| Reduction in "how do I use AI?" questions in Slack | Self-service effectiveness |
| Time-to-first-prompt for new employees | Onboarding acceleration |
