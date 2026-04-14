import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/prompts/AiPlatformButtons"
import { Heart } from "lucide-react"
import { getTagColor } from "@/lib/tag-colors"
import type { Prompt } from "@/data/types"

const MAX_VISIBLE_TAGS = 3

const thumbColors = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
]

function getThumbColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return thumbColors[Math.abs(hash) % thumbColors.length]
}

interface PromptFeedCardProps {
  prompt: Prompt
  onClick: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
  onCopy: (text: string) => void
  onInteraction?: (promptId: string) => void
}

export function PromptFeedCard({
  prompt,
  onClick,
  isFavorite,
  onToggleFavorite,
  onCopy,
  onInteraction,
}: PromptFeedCardProps) {
  const visibleTags = prompt.tags.slice(0, MAX_VISIBLE_TAGS)
  const overflowCount = prompt.tags.length - MAX_VISIBLE_TAGS

  return (
    <div
      className="rounded-lg border bg-card cursor-pointer hover:shadow-md transition-shadow p-4"
      onClick={onClick}
    >
      {/* Top row: thumbnail + title + favorite */}
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-md shrink-0 flex items-center justify-center text-lg font-bold ${getThumbColor(prompt.id)}`}
        >
          {prompt.title.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{prompt.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{prompt.overview}</p>
        </div>
        <button
          className="shrink-0 cursor-pointer text-muted-foreground hover:text-red-500 transition-colors mt-1"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>

      {/* Bottom row: tags + rating + copy button */}
      <div className="flex items-center mt-3 gap-3">
        <div className="flex flex-wrap gap-1.5 min-w-0 flex-1">
          {visibleTags.map((tag) => (
            <Badge key={tag} variant="outline" className={`text-[10px] px-1.5 py-0 ${getTagColor(tag)}`}>
              {tag}
            </Badge>
          ))}
          {overflowCount > 0 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
              +{overflowCount} more
            </Badge>
          )}
        </div>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <CopyButton text={prompt.promptText} onCopy={(text) => { onCopy(text); onInteraction?.(prompt.id) }} size="sm" label="Copy" />
        </div>
      </div>
    </div>
  )
}
