export type ModelType = "ChatGPT" | "Claude" | "Gemini" | "Model-Agnostic"

export const DEPARTMENTS = [
  "Sales",
  "Customer Success",
  "Implementation",
  "Engineering",
  "Product",
  "Marketing",
  "QA",
] as const

export type Department = (typeof DEPARTMENTS)[number]

export const TAGS = [
  // Department tags
  "Sales",
  "Customer Success",
  "Implementation",
  "Engineering",
  "Product",
  "Marketing",
  "QA",
  // Workflow tags
  "Onboarding",
  "Documentation",
  "Troubleshooting",
  "Customer-Facing",
  "Internal",
  "Outreach",
  "Analysis",
  "Automation",
] as const

export type Tag = (typeof TAGS)[number]

export interface Variable {
  name: string
  description: string
}

export interface Category {
  id: string
  name: string
  groupId: string
}

export interface UseCaseGroup {
  id: string
  name: string
  icon: string
  categoryIds: string[]
}

export interface VersionEntry {
  version: number
  date: string
  author: string
  changeDescription: string
}

export interface Bundle {
  id: string
  name: string
  description: string
  promptIds: string[]
}

export interface UseCase {
  title: string
  input: string
  output: string
}

export interface Comment {
  id: string
  author: string
  text: string
  createdAt: string
}

export interface Prompt {
  id: string
  title: string
  overview: string
  promptText: string
  departments: Department[]
  categoryId: string
  models: ModelType[]
  variables: Variable[]
  tags: string[]
  version: number
  copyCount: number
  isTrending: boolean
  bundleId?: string
  createdAt: string
  updatedAt: string
  author: string
  versionHistory: VersionEntry[]
  useCases?: UseCase[]
  comments?: Comment[]
}
