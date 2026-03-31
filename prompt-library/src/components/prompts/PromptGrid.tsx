import type { ReactNode } from "react"

interface PromptGridProps {
  children: ReactNode
}

export function PromptGrid({ children }: PromptGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  )
}
