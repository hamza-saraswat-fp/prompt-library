import type { Prompt, Category } from "@/data/types"

interface RecentlyUsedCarouselProps {
  prompts: Prompt[]
  onOpenPrompt: (prompt: Prompt) => void
  getCategoryById: (id: string) => Category | undefined
}

export function RecentlyUsedCarousel({ prompts, onOpenPrompt, getCategoryById }: RecentlyUsedCarouselProps) {
  if (prompts.length === 0) return null

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Recently Used</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {prompts.slice(0, 6).map((prompt) => {
          const category = getCategoryById(prompt.categoryId)
          return (
            <div
              key={prompt.id}
              className="px-4 py-2.5 rounded-lg border bg-card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onOpenPrompt(prompt)}
            >
              <p className="font-medium text-sm">{prompt.title}</p>
              {category && (
                <p className="text-xs text-muted-foreground">{category.name}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
