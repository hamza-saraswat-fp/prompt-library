import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, TrendingUp } from "lucide-react"
import { getTagColor } from "@/lib/tag-colors"
import type { Prompt } from "@/data/types"

const MAX_VISIBLE_TAGS = 3

interface PromptCardProps {
  prompt: Prompt
  onClick: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function PromptCard({
  prompt,
  onClick,
  isFavorite,
  onToggleFavorite,
}: PromptCardProps) {
  const visibleTags = prompt.tags.slice(0, MAX_VISIBLE_TAGS)
  const overflowCount = prompt.tags.length - MAX_VISIBLE_TAGS

  return (
    <Card
      className="flex flex-col cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <h3 className="font-semibold leading-tight line-clamp-1">{prompt.title}</h3>
            <div className="flex flex-wrap gap-1.5">
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
          </div>
          <button
            className="shrink-0 cursor-pointer text-muted-foreground hover:text-red-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{prompt.overview}</p>
        <span className="text-xs text-primary mt-1 inline-block hover:underline">Read more</span>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {prompt.isTrending && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" />
              Trending
            </Badge>
          )}
          <span>by {prompt.author}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
