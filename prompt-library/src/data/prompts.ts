import type { Prompt } from "./types"

export const prompts: Prompt[] = [
  // ── Writing & Communication ──────────────────────────────
  {
    id: "sales-1",
    title: "Cold Outreach Email",
    overview: "Generate a personalized cold outreach email for a field service business owner. The prompt produces a concise, conversational email (under 150 words) that references the prospect's industry and specific pain points, ending with a soft call-to-action rather than a hard sell.",
    promptText: `You are a sales representative at FieldPulse, a field service management software company. Write a cold outreach email to {{prospect_name}}, who is the owner of {{company_name}}, a {{industry_type}} business.

Their likely pain points include scheduling inefficiencies, missed appointments, and difficulty tracking job costs.

The email should:
- Be under 150 words
- Reference their specific industry
- Include one specific pain point relevant to {{industry_type}}
- End with a soft call-to-action (not a hard sell)
- Sound human and conversational, not corporate

Tone: Friendly, knowledgeable, peer-to-peer.`,
    departments: ["Sales"],
    categoryId: "outreach",
    models: ["Claude", "ChatGPT"],
    variables: [
      { name: "prospect_name", description: "Name of the prospect" },
      { name: "company_name", description: "Prospect's company name" },
      { name: "industry_type", description: "e.g., HVAC, Plumbing, Electrical, Landscaping" },
    ],
    version: 3,
    copyCount: 127,
    isTrending: true,
    status: "approved",
    createdAt: "2026-01-15",
    updatedAt: "2026-03-10",
    author: "Sarah Chen",
    versionHistory: [
      { version: 3, date: "2026-03-10", author: "Sarah Chen", changeDescription: "Added industry-specific pain point requirement" },
      { version: 2, date: "2026-02-20", author: "Sarah Chen", changeDescription: "Shortened word count from 200 to 150" },
      { version: 1, date: "2026-01-15", author: "Sarah Chen", changeDescription: "Initial version" },
    ],
  },
  {
    id: "sales-2",
    title: "Objection Handler: Price Too High",
    overview: "Generate a conversational response to the common 'your price is too high' sales objection. The AI acts as a sales coach, reframing cost as ROI with industry-specific examples and a follow-up question to uncover the real concern. Best used during or immediately after a call.",
    promptText: `A prospect just told me that FieldPulse is too expensive compared to {{competitor_name}}. Help me respond to this objection.

Context:
- The prospect runs a {{business_size}} {{industry_type}} company
- They currently use {{current_solution}} for scheduling and dispatch
- Our plan they're looking at costs {{plan_price}}/month

Generate a conversational response that:
1. Acknowledges their concern without being defensive
2. Reframes the cost in terms of ROI (time saved, revenue recovered from missed jobs)
3. Uses a specific example relevant to {{industry_type}} businesses
4. Asks a follow-up question to understand their real concern`,
    departments: ["Sales"],
    categoryId: "objection-handling",
    models: ["Claude"],
    variables: [
      { name: "competitor_name", description: "The competitor they're comparing against" },
      { name: "business_size", description: "e.g., 5-person, 20-person, 50-person" },
      { name: "industry_type", description: "e.g., HVAC, Plumbing, Electrical" },
      { name: "current_solution", description: "What they currently use (spreadsheets, another tool, etc.)" },
      { name: "plan_price", description: "Monthly price of the plan" },
    ],
    version: 2,
    copyCount: 89,
    isTrending: false,
    status: "approved",
    createdAt: "2026-02-01",
    updatedAt: "2026-03-05",
    author: "Mike Rodriguez",
    versionHistory: [
      { version: 2, date: "2026-03-05", author: "Mike Rodriguez", changeDescription: "Added follow-up question requirement" },
      { version: 1, date: "2026-02-01", author: "Mike Rodriguez", changeDescription: "Initial version" },
    ],
  },
  {
    id: "sales-3",
    title: "Proposal Executive Summary",
    overview: "Create a polished executive summary for a FieldPulse sales proposal. Produces 3-4 professional paragraphs covering business understanding, solution mapping, expected ROI, and next steps. Written for business owners, not technical audiences.",
    promptText: `Write an executive summary for a FieldPulse proposal to {{company_name}}.

Company details:
- Industry: {{industry_type}}
- Team size: {{team_size}} field technicians
- Current challenges: {{main_challenges}}

The summary should be 3-4 paragraphs covering:
1. Understanding of their business and challenges
2. How FieldPulse specifically addresses those challenges
3. Expected outcomes and ROI
4. Recommended next steps

Keep it professional but avoid jargon. Write for a business owner, not a technical audience.`,
    departments: ["Sales"],
    categoryId: "proposals",
    models: ["Claude", "ChatGPT"],
    variables: [
      { name: "company_name", description: "Client company name" },
      { name: "industry_type", description: "Their field service industry" },
      { name: "team_size", description: "Number of field technicians" },
      { name: "main_challenges", description: "Comma-separated list of their pain points" },
    ],
    version: 1,
    copyCount: 45,
    isTrending: false,
    status: "approved",
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
    author: "Sarah Chen",
    versionHistory: [
      { version: 1, date: "2026-03-01", author: "Sarah Chen", changeDescription: "Initial version" },
    ],
  },
  {
    id: "sales-4",
    title: "Lead Qualification Questions",
    overview: "Generate 8-10 discovery call questions tailored to a prospect's industry and team size. Questions progress from rapport-building to probing, covering current workflow, pain points, decision process, and budget. Designed to feel conversational, not like an interrogation.",
    promptText: `Generate 8-10 discovery call questions for a {{industry_type}} business that has {{team_size}} employees.

The questions should help me understand:
- Their current workflow and tools
- Pain points with scheduling and dispatch
- Decision-making process and timeline
- Budget expectations

Order the questions from easy/rapport-building to more probing. Each question should feel conversational, not like an interrogation.`,
    departments: ["Sales", "Customer Success"],
    categoryId: "lead-qualification",
    models: ["ChatGPT", "Claude"],
    variables: [
      { name: "industry_type", description: "Prospect's industry" },
      { name: "team_size", description: "Number of employees" },
    ],
    version: 1,
    copyCount: 62,
    isTrending: false,
    status: "approved",
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
    author: "Mike Rodriguez",
    versionHistory: [
      { version: 1, date: "2026-02-15", author: "Mike Rodriguez", changeDescription: "Initial version" },
    ],
  },
  {
    id: "sales-5",
    title: "Competitor Comparison Brief",
    overview: "Generate a fact-based comparison brief between FieldPulse and a competitor for sales conversations. Covers key differentiators, areas where the competitor appears stronger (with reframing), industry-specific talking points, and a killer question to highlight advantages.",
    promptText: `Create a brief comparison between FieldPulse and {{competitor_name}} for a {{industry_type}} business.

Structure it as:
1. Key differentiators (3-4 points where FieldPulse wins)
2. Areas where {{competitor_name}} may appear stronger (and how to reframe)
3. Best talking points for this specific industry
4. One killer question to ask the prospect that highlights our advantage

Keep it factual and helpful, not trash-talking. The goal is to arm our sales team with honest, useful talking points.`,
    departments: ["Sales", "Product"],
    categoryId: "competitive-analysis",
    models: ["Claude"],
    variables: [
      { name: "competitor_name", description: "The competitor to compare against" },
      { name: "industry_type", description: "The prospect's industry vertical" },
    ],
    version: 2,
    copyCount: 34,
    isTrending: false,
    status: "approved",
    createdAt: "2026-01-20",
    updatedAt: "2026-02-28",
    author: "Sarah Chen",
    versionHistory: [
      { version: 2, date: "2026-02-28", author: "Sarah Chen", changeDescription: "Added reframing section" },
      { version: 1, date: "2026-01-20", author: "Sarah Chen", changeDescription: "Initial version" },
    ],
  },
  {
    id: "sales-6",
    title: "Follow-Up Email After Demo",
    overview: "Write a personalized follow-up email after a product demo. Recaps features the prospect was excited about, proactively addresses their main concern, and confirms the agreed next step. Keeps it under 200 words and human-sounding.",
    promptText: `Write a follow-up email to {{prospect_name}} after a FieldPulse demo.

During the demo, they were most interested in: {{key_features}}
Their main concern was: {{main_concern}}
Next step we agreed on: {{next_step}}

The email should:
- Thank them for their time
- Briefly recap the features they were excited about
- Address their concern proactively
- Confirm the agreed next step with a specific date/time if possible
- Be under 200 words`,
    departments: ["Sales", "Customer Success"],
    categoryId: "follow-up",
    models: ["Model-Agnostic"],
    variables: [
      { name: "prospect_name", description: "Prospect's first name" },
      { name: "key_features", description: "Features they showed most interest in" },
      { name: "main_concern", description: "Their primary objection or concern" },
      { name: "next_step", description: "What was agreed as the next action" },
    ],
    version: 1,
    copyCount: 71,
    isTrending: true,
    status: "approved",
    createdAt: "2026-03-15",
    updatedAt: "2026-03-15",
    author: "Mike Rodriguez",
    versionHistory: [
      { version: 1, date: "2026-03-15", author: "Mike Rodriguez", changeDescription: "Initial version" },
    ],
  },

  // ── Customer Operations ──────────────────────────────────
  {
    id: "cs-1",
    title: "Ticket Response: Feature Request",
    overview: "Respond to a customer feature request support ticket with empathy and clear next steps. Acknowledges the need, confirms the request is logged for the product team, provides workaround steps if available, and sets realistic expectations without promising timelines.",
    promptText: `A FieldPulse customer submitted a support ticket requesting a feature. Write a response.

Customer name: {{customer_name}}
Company: {{company_name}}
Feature requested: {{feature_description}}
Current workaround (if any): {{workaround}}

The response should:
- Acknowledge their need and thank them for the feedback
- Explain that the request has been logged for the product team
- If there's a workaround, explain it clearly with steps
- Set realistic expectations (don't promise timelines)
- End warmly

Tone: Helpful, empathetic, professional.`,
    departments: ["Customer Success", "Product"],
    categoryId: "ticket-response",
    models: ["Claude", "ChatGPT"],
    variables: [
      { name: "customer_name", description: "Customer's name" },
      { name: "company_name", description: "Their company name" },
      { name: "feature_description", description: "What feature they want" },
      { name: "workaround", description: "Any existing workaround, or 'none'" },
    ],
    version: 2,
    copyCount: 156,
    isTrending: true,
    status: "approved",
    createdAt: "2026-01-10",
    updatedAt: "2026-03-01",
    author: "Priya Patel",
    versionHistory: [
      { version: 2, date: "2026-03-01", author: "Priya Patel", changeDescription: "Added workaround guidance" },
      { version: 1, date: "2026-01-10", author: "Priya Patel", changeDescription: "Initial version" },
    ],
  },
  {
    id: "cs-2",
    title: "Onboarding Welcome Email",
    overview: "Send a warm, personalized welcome email to a new FieldPulse customer. Covers what to expect in week one, suggests 3 quick wins before the onboarding call, and includes help doc placeholders. Part of the New Customer Onboarding bundle.",
    promptText: `Write a welcome email for {{customer_name}} at {{company_name}} who just signed up for FieldPulse.

Their plan: {{plan_name}}
Team size: {{team_size}}
Industry: {{industry_type}}
Onboarding call scheduled: {{call_date}}

Include:
- Warm welcome
- What to expect in their first week
- 3 quick wins they can do before the onboarding call
- Link placeholders for help docs (use [Help Center] as placeholder)
- Reminder about the onboarding call`,
    departments: ["Customer Success", "Implementation"],
    categoryId: "onboarding",
    models: ["Model-Agnostic"],
    variables: [
      { name: "customer_name", description: "New customer's name" },
      { name: "company_name", description: "Their company" },
      { name: "plan_name", description: "FieldPulse plan (Pro, Enterprise, etc.)" },
      { name: "team_size", description: "How many users" },
      { name: "industry_type", description: "Their industry" },
      { name: "call_date", description: "Scheduled onboarding call date" },
    ],
    version: 3,
    copyCount: 98,
    isTrending: false,
    bundleId: "bundle-onboarding",
    status: "approved",
    createdAt: "2025-12-01",
    updatedAt: "2026-02-15",
    author: "Priya Patel",
    versionHistory: [
      { version: 3, date: "2026-02-15", author: "Priya Patel", changeDescription: "Added quick wins section" },
      { version: 2, date: "2026-01-10", author: "Priya Patel", changeDescription: "Personalized by industry" },
      { version: 1, date: "2025-12-01", author: "Priya Patel", changeDescription: "Initial version" },
    ],
  },
  {
    id: "cs-3",
    title: "Onboarding Check-In (Day 7)",
    overview: "A week-one check-in email to ensure new customers are progressing with their setup. References their specific setup status, addresses known issues proactively, and suggests a targeted next step. Part of the New Customer Onboarding bundle.",
    promptText: `Write a day-7 check-in email for {{customer_name}} at {{company_name}}.

Their setup progress: {{setup_status}}
Any issues reported: {{known_issues}}

The email should:
- Check in on how their first week is going
- Reference their specific setup progress
- Address any known issues proactively
- Suggest one next step based on where they are
- Offer to hop on a quick call if they need help`,
    departments: ["Customer Success", "Implementation"],
    categoryId: "onboarding",
    models: ["Claude"],
    variables: [
      { name: "customer_name", description: "Customer name" },
      { name: "company_name", description: "Company name" },
      { name: "setup_status", description: "e.g., 'completed basic setup, hasn't added team members yet'" },
      { name: "known_issues", description: "Any reported problems, or 'none'" },
    ],
    version: 1,
    copyCount: 67,
    isTrending: false,
    bundleId: "bundle-onboarding",
    status: "approved",
    createdAt: "2026-02-01",
    updatedAt: "2026-02-01",
    author: "Priya Patel",
    versionHistory: [
      { version: 1, date: "2026-02-01", author: "Priya Patel", changeDescription: "Initial version" },
    ],
  },
  {
    id: "cs-4",
    title: "Onboarding Completion Summary",
    overview: "Send a completion email at the end of the onboarding period. Summarizes everything that was set up, lists any pending items with recommended timelines, and provides key ongoing resources. Part of the New Customer Onboarding bundle.",
    promptText: `Write an onboarding completion email for {{customer_name}} at {{company_name}}.

Setup completed: {{completed_items}}
Pending items: {{pending_items}}

Congratulate them, summarize what was set up, list any pending items with recommended timelines, and provide key resources for ongoing success. End with an invitation to reach out anytime.`,
    departments: ["Customer Success", "Implementation"],
    categoryId: "onboarding",
    models: ["Model-Agnostic"],
    variables: [
      { name: "customer_name", description: "Customer name" },
      { name: "company_name", description: "Company name" },
      { name: "completed_items", description: "What was set up successfully" },
      { name: "pending_items", description: "Anything still to do, or 'all complete'" },
    ],
    version: 1,
    copyCount: 42,
    isTrending: false,
    bundleId: "bundle-onboarding",
    status: "approved",
    createdAt: "2026-02-10",
    updatedAt: "2026-02-10",
    author: "Priya Patel",
    versionHistory: [
      { version: 1, date: "2026-02-10", author: "Priya Patel", changeDescription: "Initial version" },
    ],
  },
  {
    id: "cs-5",
    title: "Churn Risk Outreach",
    overview: "Proactive re-engagement email for customers showing signs of disengagement. Written to feel genuinely personal and helpful — not like an automated retention email. Focuses on value they may be missing and suggests one high-impact action for their specific industry.",
    promptText: `Write a re-engagement email for {{customer_name}} at {{company_name}}.

Warning signs: {{warning_signs}}
Last login: {{last_login_date}}
Account health: {{health_score}}/100

The email should feel personal and genuinely helpful, NOT like an automated retention email. Focus on value they might be missing, not on the fact that they haven't logged in. Suggest one specific action that would deliver immediate value for their {{industry_type}} business.`,
    departments: ["Customer Success"],
    categoryId: "churn-prevention",
    models: ["Claude"],
    variables: [
      { name: "customer_name", description: "Customer name" },
      { name: "company_name", description: "Company name" },
      { name: "warning_signs", description: "e.g., 'declining logins, no new jobs created in 2 weeks'" },
      { name: "last_login_date", description: "When they last logged in" },
      { name: "health_score", description: "Account health score 0-100" },
      { name: "industry_type", description: "Their industry" },
    ],
    version: 1,
    copyCount: 23,
    isTrending: false,
    status: "approved",
    createdAt: "2026-03-20",
    updatedAt: "2026-03-20",
    author: "Priya Patel",
    versionHistory: [
      { version: 1, date: "2026-03-20", author: "Priya Patel", changeDescription: "Initial version" },
    ],
  },
  {
    id: "cs-6",
    title: "QBR Prep Summary",
    overview: "Generate a structured quarterly business review preparation summary. Takes key account metrics (jobs, users, features, tickets) and produces a presentation-ready summary with highlights, areas for improvement, recommended actions, and discussion questions.",
    promptText: `Prepare a QBR summary for {{company_name}}.

Key metrics this quarter:
- Jobs completed: {{jobs_completed}}
- Active users: {{active_users}} / {{total_users}}
- Most used features: {{top_features}}
- Support tickets: {{ticket_count}}

Generate a structured summary with: highlights, areas for improvement, recommended next steps, and 2-3 discussion questions for the meeting.`,
    departments: ["Customer Success", "Sales"],
    categoryId: "qbr-prep",
    models: ["Claude", "Gemini"],
    variables: [
      { name: "company_name", description: "Customer company name" },
      { name: "jobs_completed", description: "Number of jobs this quarter" },
      { name: "active_users", description: "Active users count" },
      { name: "total_users", description: "Total licensed users" },
      { name: "top_features", description: "Most used features" },
      { name: "ticket_count", description: "Support tickets submitted" },
    ],
    version: 1,
    copyCount: 15,
    isTrending: false,
    status: "approved",
    createdAt: "2026-03-25",
    updatedAt: "2026-03-25",
    author: "Jordan Lee",
    versionHistory: [
      { version: 1, date: "2026-03-25", author: "Jordan Lee", changeDescription: "Initial version" },
    ],
  },

  // ── Development & Technical ──────────────────────────────
  {
    id: "eng-1",
    title: "Code Review Checklist",
    overview: "Generate a focused, prioritized code review checklist tailored to the type of change being reviewed. Organizes items by priority (Critical, Important, Nice-to-have) covering security, performance, error handling, testing, and readability. Skips irrelevant items automatically.",
    promptText: `Generate a code review checklist for a {{change_type}} in our {{language}} codebase.

The PR touches: {{affected_areas}}

Create a checklist organized by priority (Critical, Important, Nice-to-have) that covers:
- Security implications
- Performance considerations
- Error handling
- Test coverage
- Code style and readability

Keep each item actionable and specific to the change type. Skip items that don't apply.`,
    departments: ["Engineering"],
    categoryId: "code-review",
    models: ["Claude"],
    variables: [
      { name: "change_type", description: "e.g., 'new API endpoint', 'database migration', 'UI component'" },
      { name: "language", description: "e.g., TypeScript, Ruby, Python" },
      { name: "affected_areas", description: "Parts of the codebase affected" },
    ],
    version: 2,
    copyCount: 84,
    isTrending: false,
    status: "approved",
    createdAt: "2026-01-05",
    updatedAt: "2026-02-20",
    author: "Alex Kim",
    versionHistory: [
      { version: 2, date: "2026-02-20", author: "Alex Kim", changeDescription: "Added priority levels" },
      { version: 1, date: "2026-01-05", author: "Alex Kim", changeDescription: "Initial version" },
    ],
  },
  {
    id: "eng-2",
    title: "API Documentation Generator",
    overview: "Generate complete REST API endpoint documentation from a code snippet or description. Produces method/path, parameter tables, response examples with JSON, error responses, and a curl command. Follows REST documentation best practices with precise types.",
    promptText: `Generate API documentation for the following endpoint:

{{endpoint_description}}

Format the documentation with:
- HTTP method and path
- Description
- Request parameters (path, query, body) in a table
- Response format with example JSON
- Error responses
- Example curl command

Follow REST API documentation best practices. Be precise about types.`,
    departments: ["Engineering", "Product"],
    categoryId: "documentation",
    models: ["Claude", "ChatGPT"],
    variables: [
      { name: "endpoint_description", description: "Paste the endpoint code or describe it" },
    ],
    version: 1,
    copyCount: 56,
    isTrending: false,
    status: "approved",
    createdAt: "2026-02-10",
    updatedAt: "2026-02-10",
    author: "Alex Kim",
    versionHistory: [
      { version: 1, date: "2026-02-10", author: "Alex Kim", changeDescription: "Initial version" },
    ],
  },
  {
    id: "eng-3",
    title: "Debug Assistant",
    overview: "Help debug an issue by analyzing error messages, logs, and code context. Walks through what the error means, ranks probable root causes by likelihood, provides step-by-step debugging instructions, and suggests fixes for each cause. Great for unblocking yourself quickly.",
    promptText: `Help me debug this issue:

Error message: {{error_message}}
Where it occurs: {{location}}
What I've tried: {{attempted_fixes}}
Relevant code context: {{code_context}}

Walk me through:
1. What the error likely means
2. Most probable root causes (ranked by likelihood)
3. Debugging steps to narrow it down
4. Suggested fix for each probable cause`,
    departments: ["Engineering", "QA"],
    categoryId: "debugging",
    models: ["Claude"],
    variables: [
      { name: "error_message", description: "The error message or stack trace" },
      { name: "location", description: "File/function where the error occurs" },
      { name: "attempted_fixes", description: "What you've already tried" },
      { name: "code_context", description: "Relevant code snippet" },
    ],
    version: 1,
    copyCount: 103,
    isTrending: true,
    status: "approved",
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
    author: "Alex Kim",
    versionHistory: [
      { version: 1, date: "2026-01-20", author: "Alex Kim", changeDescription: "Initial version" },
    ],
  },
  {
    id: "eng-4",
    title: "Architecture Decision Record",
    overview: "Draft a concise Architecture Decision Record (ADR) for a technical decision. Produces a structured document with Status, Context, Decision, Consequences, and Alternatives Considered. Each section is kept to 2-4 sentences for readability.",
    promptText: `Draft an Architecture Decision Record (ADR) for the following decision:

Decision: {{decision_title}}
Context: {{context}}
Options considered: {{options}}

Format as a standard ADR with sections:
- Status (Proposed)
- Context
- Decision
- Consequences (positive and negative)
- Alternatives Considered

Keep it concise. Each section should be 2-4 sentences max.`,
    departments: ["Engineering", "Product"],
    categoryId: "architecture",
    models: ["Claude"],
    variables: [
      { name: "decision_title", description: "What decision was made" },
      { name: "context", description: "Why this decision is needed" },
      { name: "options", description: "Comma-separated list of options that were considered" },
    ],
    version: 1,
    copyCount: 28,
    isTrending: false,
    status: "approved",
    createdAt: "2026-03-10",
    updatedAt: "2026-03-10",
    author: "Alex Kim",
    versionHistory: [
      { version: 1, date: "2026-03-10", author: "Alex Kim", changeDescription: "Initial version" },
    ],
  },

  // ── Planning & Strategy ──────────────────────────────────
  {
    id: "prod-1",
    title: "PRD Writer",
    overview: "Generate a structured product requirements document for a new feature. Produces a focused, practical PRD with Problem Statement, Proposed Solution, User Stories, Acceptance Criteria, Out of Scope, and Open Questions. Designed for internal alignment, not external specs.",
    promptText: `Write a PRD for the following feature:

Feature name: {{feature_name}}
Problem it solves: {{problem_statement}}
Target users: {{target_users}}
Success metrics: {{success_metrics}}

Structure the PRD with:
1. Problem Statement
2. Proposed Solution (high-level)
3. User Stories (3-5)
4. Acceptance Criteria
5. Out of Scope
6. Open Questions

Keep it focused and practical. This is for internal alignment, not an external spec.`,
    departments: ["Product", "Engineering"],
    categoryId: "prds",
    models: ["Claude"],
    variables: [
      { name: "feature_name", description: "Name of the feature" },
      { name: "problem_statement", description: "What problem does this solve" },
      { name: "target_users", description: "Who is this for" },
      { name: "success_metrics", description: "How we'll measure success" },
    ],
    version: 2,
    copyCount: 41,
    isTrending: false,
    status: "approved",
    createdAt: "2026-01-08",
    updatedAt: "2026-02-25",
    author: "Hamza Saraswat",
    versionHistory: [
      { version: 2, date: "2026-02-25", author: "Hamza Saraswat", changeDescription: "Added Out of Scope section" },
      { version: 1, date: "2026-01-08", author: "Hamza Saraswat", changeDescription: "Initial version" },
    ],
  },
  {
    id: "prod-2",
    title: "User Story Generator",
    overview: "Generate user stories with acceptance criteria from a feature description. Each story follows 'As a [role], I want [action] so that [benefit]' format with 3-5 acceptance criteria and edge cases. Stories are ordered by priority and focus on the user's perspective.",
    promptText: `Generate user stories for this feature: {{feature_description}}

For each user story, provide:
- Story format: "As a [role], I want [action] so that [benefit]"
- 3-5 acceptance criteria
- Edge cases to consider

Generate {{story_count}} user stories, ordered by priority. Focus on the user's perspective, not implementation details.`,
    departments: ["Product", "Engineering"],
    categoryId: "user-stories",
    models: ["Claude", "ChatGPT"],
    variables: [
      { name: "feature_description", description: "Describe the feature" },
      { name: "story_count", description: "How many stories to generate (e.g., 5)" },
    ],
    version: 1,
    copyCount: 33,
    isTrending: false,
    status: "approved",
    createdAt: "2026-02-18",
    updatedAt: "2026-02-18",
    author: "Hamza Saraswat",
    versionHistory: [
      { version: 1, date: "2026-02-18", author: "Hamza Saraswat", changeDescription: "Initial version" },
    ],
  },
  {
    id: "prod-3",
    title: "Release Notes Drafter",
    overview: "Draft customer-facing release notes from a list of changes. Groups changes by category (New Features, Improvements, Bug Fixes), uses simple non-technical language, and explains the benefit of each change rather than just what changed. Includes a brief intro paragraph.",
    promptText: `Draft release notes for FieldPulse version {{version_number}}.

Changes included:
{{change_list}}

Write customer-facing release notes that:
- Group changes by category (New Features, Improvements, Bug Fixes)
- Use simple language (not technical jargon)
- Explain the benefit of each change, not just what changed
- Are scannable with bullet points
- Include a brief intro paragraph`,
    departments: ["Product", "Marketing"],
    categoryId: "release-notes",
    models: ["Model-Agnostic"],
    variables: [
      { name: "version_number", description: "e.g., 4.2.0" },
      { name: "change_list", description: "List of changes/PRs included in this release" },
    ],
    version: 1,
    copyCount: 19,
    isTrending: false,
    status: "approved",
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
    author: "Hamza Saraswat",
    versionHistory: [
      { version: 1, date: "2026-03-05", author: "Hamza Saraswat", changeDescription: "Initial version" },
    ],
  },
  {
    id: "prod-4",
    title: "Competitive Analysis Framework",
    overview: "Analyze a competitor's product against FieldPulse across key dimensions. Produces a structured comparison with feature tables, pricing analysis, strengths/weaknesses, market positioning differences, and strategic takeaways. Useful for sales enablement and product strategy.",
    promptText: `Create a competitive analysis comparing FieldPulse to {{competitor_name}}.

Focus areas: {{focus_areas}}
Target market: {{target_market}}

Structure the analysis as:
1. Feature comparison table (FieldPulse vs {{competitor_name}})
2. Pricing comparison
3. Strengths and weaknesses of each
4. Market positioning differences
5. Key takeaways for product strategy`,
    departments: ["Product", "Sales"],
    categoryId: "competitive-analysis",
    models: ["Claude", "Gemini"],
    variables: [
      { name: "competitor_name", description: "Competitor to analyze" },
      { name: "focus_areas", description: "Specific areas to compare" },
      { name: "target_market", description: "Market segment to focus on" },
    ],
    version: 1,
    copyCount: 12,
    isTrending: false,
    status: "pending",
    createdAt: "2026-03-28",
    updatedAt: "2026-03-28",
    author: "Hamza Saraswat",
    versionHistory: [
      { version: 1, date: "2026-03-28", author: "Hamza Saraswat", changeDescription: "Initial version" },
    ],
  },
  {
    id: "impl-1",
    title: "Customer Setup Checklist",
    overview: "Generate a customized implementation setup checklist phased by timeline (Day 1, Week 1, Week 2). Includes estimated time per task, industry-specific tips, and covers features and integrations. Useful for implementation managers starting a new customer engagement.",
    promptText: `Create a setup checklist for {{company_name}} implementing FieldPulse.

Configuration needs:
- Industry: {{industry_type}}
- Team size: {{team_size}}
- Features to set up: {{features_list}}
- Integrations needed: {{integrations}}

Generate a step-by-step checklist grouped by phase (Day 1, Week 1, Week 2) with estimated time per task. Include tips specific to {{industry_type}} businesses.`,
    departments: ["Implementation", "Customer Success"],
    categoryId: "setup-guides",
    models: ["Claude"],
    variables: [
      { name: "company_name", description: "Customer company" },
      { name: "industry_type", description: "Their industry" },
      { name: "team_size", description: "Number of users" },
      { name: "features_list", description: "Features being set up" },
      { name: "integrations", description: "Third-party integrations needed" },
    ],
    version: 1,
    copyCount: 31,
    isTrending: false,
    status: "approved",
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
    author: "Taylor Brooks",
    versionHistory: [
      { version: 1, date: "2026-02-05", author: "Taylor Brooks", changeDescription: "Initial version" },
    ],
  },
  {
    id: "impl-2",
    title: "Data Migration Guide",
    overview: "Generate a complete data migration plan for customers switching from another tool to FieldPulse. Includes pre-migration checklist, step-by-step process, data mapping recommendations, validation steps, and a rollback plan. Tailored to the volume and types of data being moved.",
    promptText: `Create a data migration guide for {{company_name}} switching from {{previous_tool}} to FieldPulse.

Data to migrate: {{data_types}}
Volume: approximately {{record_count}} records
Timeline: {{target_date}}

Include:
- Pre-migration checklist
- Step-by-step migration process
- Data mapping recommendations
- Validation steps
- Rollback plan`,
    departments: ["Implementation", "Engineering"],
    categoryId: "migration",
    models: ["Claude"],
    variables: [
      { name: "company_name", description: "Customer company" },
      { name: "previous_tool", description: "Tool they're migrating from" },
      { name: "data_types", description: "What data needs to move (customers, jobs, invoices, etc.)" },
      { name: "record_count", description: "Approximate number of records" },
      { name: "target_date", description: "Migration deadline" },
    ],
    version: 1,
    copyCount: 18,
    isTrending: false,
    status: "approved",
    createdAt: "2026-03-12",
    updatedAt: "2026-03-12",
    author: "Taylor Brooks",
    versionHistory: [
      { version: 1, date: "2026-03-12", author: "Taylor Brooks", changeDescription: "Initial version" },
    ],
  },

  // ── Content & Marketing ──────────────────────────────────
  {
    id: "mkt-1",
    title: "Blog Post Outline",
    overview: "Generate a structured blog post outline for the FieldPulse blog. Produces 3 compelling title options, a hook/intro approach, section headings with bullet points, a CTA suggestion, and SEO keyword targets. Tailored to the specified audience and goal.",
    promptText: `Create a blog post outline for the FieldPulse blog.

Topic: {{topic}}
Target audience: {{audience}}
Goal: {{goal}}
Target word count: {{word_count}}

Generate an outline with:
- Compelling title options (3)
- Hook/intro approach
- Section headings with 2-3 bullet points each
- CTA suggestion
- SEO keywords to target`,
    departments: ["Marketing"],
    categoryId: "blog-posts",
    models: ["ChatGPT", "Claude"],
    variables: [
      { name: "topic", description: "Blog post topic" },
      { name: "audience", description: "Who is this for" },
      { name: "goal", description: "What should the reader do after" },
      { name: "word_count", description: "Target length (e.g., 1500)" },
    ],
    version: 1,
    copyCount: 27,
    isTrending: false,
    status: "approved",
    createdAt: "2026-02-22",
    updatedAt: "2026-02-22",
    author: "Emma Davis",
    versionHistory: [
      { version: 1, date: "2026-02-22", author: "Emma Davis", changeDescription: "Initial version" },
    ],
  },
  {
    id: "mkt-2",
    title: "Social Media Post Generator",
    overview: "Generate social media posts promoting FieldPulse content or features. Produces 3 variations — short and punchy, medium with a stat/question hook, and longer storytelling — with relevant hashtags. Tone is professional but approachable for blue-collar business owners.",
    promptText: `Write social media posts for {{platform}} promoting: {{content_to_promote}}

Key message: {{key_message}}

Generate 3 variations:
1. Short and punchy (under 100 characters)
2. Medium with a stat or question hook
3. Longer storytelling approach

Include relevant hashtags. Tone should be professional but approachable — we're talking to blue-collar business owners, not tech executives.`,
    departments: ["Marketing", "Sales"],
    categoryId: "social-media",
    models: ["ChatGPT"],
    variables: [
      { name: "platform", description: "LinkedIn, Twitter/X, Facebook, etc." },
      { name: "content_to_promote", description: "Blog post, feature, event, etc." },
      { name: "key_message", description: "Core message to convey" },
    ],
    version: 1,
    copyCount: 35,
    isTrending: false,
    status: "approved",
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
    author: "Emma Davis",
    versionHistory: [
      { version: 1, date: "2026-03-01", author: "Emma Davis", changeDescription: "Initial version" },
    ],
  },

  // ── Development & Technical (QA) ─────────────────────────
  {
    id: "qa-1",
    title: "Test Case Generator",
    overview: "Generate comprehensive test cases for a feature based on its requirements. Each test case includes an ID, description, preconditions, steps, expected result, and priority level. Covers both positive and negative scenarios, focusing on user-facing behavior.",
    promptText: `Generate test cases for the following feature:

Feature: {{feature_name}}
Requirements: {{requirements}}
Edge cases to consider: {{edge_cases}}

For each test case provide:
- Test ID
- Description
- Preconditions
- Steps
- Expected result
- Priority (High/Medium/Low)

Include both positive and negative test cases. Focus on user-facing behavior, not implementation details.`,
    departments: ["QA", "Engineering"],
    categoryId: "test-cases",
    models: ["Claude"],
    variables: [
      { name: "feature_name", description: "Feature being tested" },
      { name: "requirements", description: "Feature requirements/acceptance criteria" },
      { name: "edge_cases", description: "Known edge cases or tricky scenarios" },
    ],
    version: 1,
    copyCount: 44,
    isTrending: false,
    status: "approved",
    createdAt: "2026-02-14",
    updatedAt: "2026-02-14",
    author: "Chris Nguyen",
    versionHistory: [
      { version: 1, date: "2026-02-14", author: "Chris Nguyen", changeDescription: "Initial version" },
    ],
  },
  {
    id: "qa-2",
    title: "Bug Report Template",
    overview: "Generate a well-structured bug report from a rough description. Produces a clear title, numbered steps to reproduce, expected vs actual behavior, environment details, and suggested severity. Useful for turning informal bug reports into actionable tickets.",
    promptText: `Write a structured bug report from this description: {{rough_description}}

Environment: {{environment}}
Severity: {{severity}}

Format the report with:
- Title (clear, searchable)
- Steps to Reproduce (numbered)
- Expected Behavior
- Actual Behavior
- Environment details
- Screenshots/logs needed (describe what to capture)
- Suggested severity and priority`,
    departments: ["QA", "Engineering"],
    categoryId: "bug-reports",
    models: ["Model-Agnostic"],
    variables: [
      { name: "rough_description", description: "Rough description of the bug" },
      { name: "environment", description: "e.g., Production, Staging, browser/device info" },
      { name: "severity", description: "Critical, High, Medium, Low" },
    ],
    version: 1,
    copyCount: 52,
    isTrending: false,
    status: "pending",
    createdAt: "2026-03-22",
    updatedAt: "2026-03-22",
    author: "Chris Nguyen",
    versionHistory: [
      { version: 1, date: "2026-03-22", author: "Chris Nguyen", changeDescription: "Initial version" },
    ],
  },
]
