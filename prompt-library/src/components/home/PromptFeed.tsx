import { PromptFeedCard } from "./PromptFeedCard"
import type { Prompt } from "@/data/types"
import type { RatingInfo } from "@/hooks/useRatings"

interface PromptFeedProps {
  prompts: Prompt[]
  searchQuery: string
  onOpenPrompt: (prompt: Prompt) => void
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  onCopy: (text: string) => void
  onInteraction?: (promptId: string) => void
  getRating: (promptId: string) => RatingInfo
  onVote: (promptId: string, direction: "up" | "down") => void
}

export function PromptFeed({
  prompts,
  searchQuery,
  onOpenPrompt,
  isFavorite,
  toggleFavorite,
  onCopy,
  onInteraction,
  getRating,
  onVote,
}: PromptFeedProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        {searchQuery ? `Search results for "${searchQuery}"` : "Recommended Prompts"}
      </h2>
      {prompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            {searchQuery
              ? `No prompts found for "${searchQuery}"`
              : "No prompts available"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery ? "Try a different search term." : "Check back soon."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {prompts.map((prompt) => (
            <PromptFeedCard
              key={prompt.id}
              prompt={prompt}
              onClick={() => onOpenPrompt(prompt)}
              isFavorite={isFavorite(prompt.id)}
              onToggleFavorite={() => toggleFavorite(prompt.id)}
              onCopy={onCopy}
              onInteraction={onInteraction}
              rating={getRating(prompt.id)}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </div>
  )
}
