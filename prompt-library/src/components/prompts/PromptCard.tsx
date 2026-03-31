import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Heart, TrendingUp, Clock } from "lucide-react"
import { modelColors } from "@/lib/constants"
import type { Prompt } from "@/data/types"

interface PromptCardProps {
  prompt: Prompt
  teamName: string
  onCopy: () => void
  onClick: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function PromptCard({
  prompt,
  teamName,
  onCopy,
  onClick,
  isFavorite,
  onToggleFavorite,
}: PromptCardProps) {
  const hasVariables = prompt.variables.length > 0

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
              {prompt.models.map((model) => (
                <Badge
                  key={model}
                  className={`text-[10px] px-1.5 py-0 ${modelColors[model] ?? ""}`}
                >
                  {model}
                </Badge>
              ))}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {teamName}
              </Badge>
              {prompt.status === "pending" && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-yellow-500 text-yellow-600 dark:text-yellow-400">
                  <Clock className="h-2.5 w-2.5 mr-0.5" />
                  Pending
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
        <p className="text-sm text-muted-foreground line-clamp-3">{prompt.description}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>v{prompt.version}</span>
          <span>{prompt.copyCount} copies</span>
          {prompt.isTrending && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" />
              Trending
            </Badge>
          )}
        </div>
        {/* Only show Copy on cards without variables — cards with variables require the drawer to fill in */}
        {!hasVariables && (
          <Button
            size="sm"
            className="h-7 text-xs cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              onCopy()
            }}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
