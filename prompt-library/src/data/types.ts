export type ModelType = "ChatGPT" | "Claude" | "Gemini" | "Model-Agnostic"

export type PromptStatus = "approved" | "pending"

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

export interface Prompt {
  id: string
  title: string
  overview: string
  promptText: string
  departments: Department[]
  categoryId: string
  models: ModelType[]
  variables: Variable[]
  version: number
  copyCount: number
  isTrending: boolean
  bundleId?: string
  status: PromptStatus
  createdAt: string
  updatedAt: string
  author: string
  versionHistory: VersionEntry[]
}
