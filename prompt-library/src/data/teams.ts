import type { UseCaseGroup, Category, Bundle } from "./types"

// ── Global Categories (deduplicated, grouped by use-case) ──

export const categories: Category[] = [
  // Writing & Communication
  { id: "outreach", name: "Outreach", groupId: "writing" },
  { id: "proposals", name: "Proposals", groupId: "writing" },
  { id: "follow-up", name: "Follow-Up", groupId: "writing" },
  { id: "check-in", name: "Check-In Messaging", groupId: "writing" },
  { id: "social-media", name: "Social Media", groupId: "writing" },
  { id: "objection-handling", name: "Objection Handling", groupId: "writing" },

  // Analysis & Research
  { id: "competitive-analysis", name: "Competitive Analysis", groupId: "analysis" },
  { id: "lead-qualification", name: "Lead Qualification", groupId: "analysis" },
  { id: "data-analysis", name: "Data Analysis", groupId: "analysis" },

  // Customer Operations
  { id: "ticket-response", name: "Ticket Response", groupId: "customer-ops" },
  { id: "onboarding", name: "Onboarding", groupId: "customer-ops" },
  { id: "churn-prevention", name: "Churn Prevention", groupId: "customer-ops" },
  { id: "escalation", name: "Escalation", groupId: "customer-ops" },
  { id: "qbr-prep", name: "QBR Prep", groupId: "customer-ops" },

  // Development & Technical
  { id: "code-review", name: "Code Review", groupId: "development" },
  { id: "debugging", name: "Debugging", groupId: "development" },
  { id: "documentation", name: "Documentation", groupId: "development" },
  { id: "architecture", name: "Architecture", groupId: "development" },
  { id: "test-cases", name: "Test Cases", groupId: "development" },
  { id: "bug-reports", name: "Bug Reports", groupId: "development" },

  // Planning & Strategy
  { id: "prds", name: "PRDs", groupId: "planning" },
  { id: "user-stories", name: "User Stories", groupId: "planning" },
  { id: "release-notes", name: "Release Notes", groupId: "planning" },
  { id: "setup-guides", name: "Setup Guides", groupId: "planning" },
  { id: "migration", name: "Migration", groupId: "planning" },

  // Content & Marketing
  { id: "blog-posts", name: "Blog Posts", groupId: "content" },
  { id: "campaign-briefs", name: "Campaign Briefs", groupId: "content" },
  { id: "seo", name: "SEO", groupId: "content" },
  { id: "training-materials", name: "Training Materials", groupId: "content" },
]

// ── Use-Case Groups (sidebar navigation) ──

export const useCaseGroups: UseCaseGroup[] = [
  {
    id: "writing",
    name: "Writing & Communication",
    icon: "PenLine",
    categoryIds: ["outreach", "proposals", "follow-up", "check-in", "social-media", "objection-handling"],
  },
  {
    id: "analysis",
    name: "Analysis & Research",
    icon: "BarChart3",
    categoryIds: ["competitive-analysis", "lead-qualification", "data-analysis"],
  },
  {
    id: "customer-ops",
    name: "Customer Operations",
    icon: "Headphones",
    categoryIds: ["ticket-response", "onboarding", "churn-prevention", "escalation", "qbr-prep"],
  },
  {
    id: "development",
    name: "Development & Technical",
    icon: "Code",
    categoryIds: ["code-review", "debugging", "documentation", "architecture", "test-cases", "bug-reports"],
  },
  {
    id: "planning",
    name: "Planning & Strategy",
    icon: "Target",
    categoryIds: ["prds", "user-stories", "release-notes", "setup-guides", "migration"],
  },
  {
    id: "content",
    name: "Content & Marketing",
    icon: "Palette",
    categoryIds: ["blog-posts", "campaign-briefs", "seo", "training-materials"],
  },
]

// ── Bundles ──

export const bundles: Bundle[] = [
  {
    id: "bundle-onboarding",
    name: "New Customer Onboarding",
    description: "A complete set of prompts for onboarding new FieldPulse customers",
    promptIds: ["cs-2", "cs-3", "cs-4"],
  },
]

// ── Helpers ──

export function getGroupById(id: string): UseCaseGroup | undefined {
  return useCaseGroups.find((g) => g.id === id)
}

export function getCategoriesForGroup(groupId: string): Category[] {
  const group = useCaseGroups.find((g) => g.id === groupId)
  if (!group) return []
  return categories.filter((c) => group.categoryIds.includes(c.id))
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}
