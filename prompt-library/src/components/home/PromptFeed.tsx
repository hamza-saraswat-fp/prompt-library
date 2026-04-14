import { PromptFeedCard } from "./PromptFeedCard"
import { BookOpen, ArrowRight, Star } from "lucide-react"
import type { Prompt } from "@/data/types"

const GUIDE_ID = "prompt-writing-guide"

interface PromptFeedProps {
  prompts: Prompt[]
  searchQuery: string
  onOpenPrompt: (prompt: Prompt) => void
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  onCopy: (text: string) => void
  onInteraction?: (promptId: string) => void
}

export function PromptFeed({
  prompts,
  searchQuery,
  onOpenPrompt,
  isFavorite,
  toggleFavorite,
  onCopy,
  onInteraction,
}: PromptFeedProps) {
  // Separate the guide from normal prompts so it's not duplicated
  const guidePrompt = prompts.find((p) => p.id === GUIDE_ID)
  const feedPrompts = prompts.filter((p) => p.id !== GUIDE_ID)

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        {searchQuery ? `Search results for "${searchQuery}"` : "Recommended Prompts"}
      </h2>

      {/* Pinned Prompt Writing Guide banner */}
      {guidePrompt && (
        <div
          className="mb-4 flex items-center gap-4 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4 cursor-pointer hover:shadow-md transition-shadow group"
          onClick={() => onOpenPrompt(guidePrompt)}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{guidePrompt.title}</p>
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {"New to prompts? Learn how to write effective prompts and use the {{variable}} syntax."}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        </div>
      )}

      {feedPrompts.length === 0 ? (
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
          {feedPrompts.map((prompt) => (
            <PromptFeedCard
              key={prompt.id}
              prompt={prompt}
              onClick={() => onOpenPrompt(prompt)}
              isFavorite={isFavorite(prompt.id)}
              onToggleFavorite={() => toggleFavorite(prompt.id)}
              onCopy={onCopy}
              onInteraction={onInteraction}
            />
          ))}
        </div>
      )}
    </div>
  )
}
