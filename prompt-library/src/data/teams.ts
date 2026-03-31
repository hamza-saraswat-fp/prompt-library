import type { Team, Bundle } from "./types"

export const teams: Team[] = [
  {
    id: "sales",
    name: "Sales",
    icon: "TrendingUp",
    categories: [
      { id: "sales-outreach", name: "Outreach", teamId: "sales" },
      { id: "sales-objection", name: "Objection Handling", teamId: "sales" },
      { id: "sales-proposals", name: "Proposals", teamId: "sales" },
      { id: "sales-qualification", name: "Lead Qualification", teamId: "sales" },
      { id: "sales-competitive", name: "Competitive Analysis", teamId: "sales" },
    ],
  },
  {
    id: "cs",
    name: "Customer Success",
    icon: "HeartHandshake",
    categories: [
      { id: "cs-tickets", name: "Ticket Responses", teamId: "cs" },
      { id: "cs-onboarding", name: "Onboarding", teamId: "cs" },
      { id: "cs-churn", name: "Churn Prevention", teamId: "cs" },
      { id: "cs-checkin", name: "Check-ins", teamId: "cs" },
      { id: "cs-escalation", name: "Escalation", teamId: "cs" },
    ],
  },
  {
    id: "implementation",
    name: "Implementation",
    icon: "Settings",
    categories: [
      { id: "impl-setup", name: "Setup Guides", teamId: "implementation" },
      { id: "impl-migration", name: "Migration", teamId: "implementation" },
    ],
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: "Code",
    categories: [
      { id: "eng-review", name: "Code Review", teamId: "engineering" },
      { id: "eng-docs", name: "Documentation", teamId: "engineering" },
      { id: "eng-debug", name: "Debugging", teamId: "engineering" },
      { id: "eng-architecture", name: "Architecture", teamId: "engineering" },
    ],
  },
  {
    id: "product",
    name: "Product",
    icon: "Lightbulb",
    categories: [
      { id: "prod-prd", name: "PRDs", teamId: "product" },
      { id: "prod-stories", name: "User Stories", teamId: "product" },
      { id: "prod-releases", name: "Release Notes", teamId: "product" },
      { id: "prod-competitive", name: "Competitive Analysis", teamId: "product" },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: "Megaphone",
    categories: [
      { id: "mkt-content", name: "Content", teamId: "marketing" },
      { id: "mkt-social", name: "Social Media", teamId: "marketing" },
    ],
  },
  {
    id: "qa",
    name: "QA",
    icon: "ShieldCheck",
    categories: [
      { id: "qa-testcases", name: "Test Cases", teamId: "qa" },
      { id: "qa-bugs", name: "Bug Reports", teamId: "qa" },
    ],
  },
]

export const bundles: Bundle[] = [
  {
    id: "bundle-onboarding",
    name: "New Customer Onboarding",
    description: "A complete set of prompts for onboarding new FieldPulse customers",
    promptIds: ["cs-2", "cs-3", "cs-4"],
  },
]

export function getTeamById(id: string): Team | undefined {
  return teams.find((t) => t.id === id)
}

export function getCategoriesForTeam(teamId: string): Team["categories"] {
  return teams.find((t) => t.id === teamId)?.categories ?? []
}
