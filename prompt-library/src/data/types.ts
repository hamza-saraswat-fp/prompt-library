export type ModelType = "ChatGPT" | "Claude" | "Gemini" | "Model-Agnostic"

export type PromptStatus = "approved" | "pending"

export interface Variable {
  name: string
  description: string
}

export interface Category {
  id: string
  name: string
  teamId: string
}

export interface Team {
  id: string
  name: string
  icon: string
  categories: Category[]
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
  description: string
  promptText: string
  teamId: string
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
