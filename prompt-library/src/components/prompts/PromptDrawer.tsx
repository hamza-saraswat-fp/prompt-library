import { useState, useEffect, useMemo } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Copy,
  Heart,
  TrendingUp,
  Clock,
  History,
  BarChart3,
  GitCommit,
  ChevronDown,
  ChevronUp,
  Maximize2,
  X,
} from "lucide-react"
import { fillVariables, variableToLabel, segmentPromptText } from "@/lib/variables"
import { modelColors } from "@/lib/constants"
import type { Prompt } from "@/data/types"

interface PromptDrawerProps {
  prompt: Prompt | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCopy: (text: string) => void
  isFavorite: boolean
  onToggleFavorite: () => void
  onOpenFullView: () => void
}

export function PromptDrawer({
  prompt,
  open,
  onOpenChange,
  onCopy,
  isFavorite,
  onToggleFavorite,
  onOpenFullView,
}: PromptDrawerProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  useEffect(() => {
    setVariableValues({})
    setShowVersionHistory(false)
  }, [prompt?.id])

  const filledText = useMemo(() => {
    if (!prompt) return ""
    return fillVariables(prompt.promptText, variableValues)
  }, [prompt, variableValues])

  const segments = useMemo(() => segmentPromptText(filledText), [filledText])

  if (!prompt) return null

  const hasVariables = prompt.variables.length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:!max-w-5xl overflow-hidden flex flex-col px-12 py-8" showCloseButton={false}>
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            onClick={onOpenFullView}
            title="Open full view"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            onClick={() => onOpenChange(false)}
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SheetHeader className="shrink-0 pr-24">
          <SheetTitle className="text-left text-xl">{prompt.title}</SheetTitle>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {prompt.models.map((model) => (
              <Badge
                key={model}
                className={`text-[10px] px-1.5 py-0 ${modelColors[model] ?? ""}`}
              >
                {model}
              </Badge>
            ))}
            {prompt.departments.map((dept) => (
              <Badge key={dept} variant="outline" className="text-[10px] px-1.5 py-0">
                {dept}
              </Badge>
            ))}
            {prompt.status === "pending" && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-yellow-500 text-yellow-600 dark:text-yellow-400">
                <Clock className="h-2.5 w-2.5 mr-0.5" />
                Pending Review
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">{prompt.overview}</p>
        </SheetHeader>

        <ScrollArea className="flex-1 mt-6 min-h-0">
          <div className="space-y-5 pr-6">
            {/* Metadata row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <button
                className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
                onClick={() => setShowVersionHistory((prev) => !prev)}
              >
                <History className="h-3.5 w-3.5" />
                v{prompt.version}
                {showVersionHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              <span className="flex items-center gap-1">
                <BarChart3 className="h-3.5 w-3.5" />
                {prompt.copyCount} copies this month
              </span>
              {prompt.isTrending && (
                <span className="flex items-center gap-1 text-orange-500">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Trending
                </span>
              )}
              <span>by {prompt.author}</span>
            </div>

            {/* Inline version history */}
            {showVersionHistory && (
              <div className="rounded-md border bg-muted/50 p-3 space-y-3">
                <h4 className="text-xs font-medium">Version History</h4>
                {prompt.versionHistory.map((entry, i) => (
                  <div key={entry.version} className="relative flex gap-3">
                    {i < prompt.versionHistory.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
                    )}
                    <div className="mt-0.5 shrink-0">
                      <GitCommit className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">v{entry.version}</span>
                        {i === 0 && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{entry.changeDescription}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {entry.author} &middot; {entry.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            {/* Prompt text */}
            <div>
              <h4 className="text-sm font-medium mb-2">Prompt</h4>
              <div className="rounded-md bg-muted p-6 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                {segments.map((seg) =>
                  seg.isVariable ? (
                    <span key={seg.key} className="rounded bg-primary/10 px-1 py-0.5 text-primary font-medium">
                      {seg.text}
                    </span>
                  ) : (
                    <span key={seg.key}>{seg.text}</span>
                  )
                )}
              </div>
            </div>

            {/* Variable inputs */}
            {hasVariables && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-3">Fill in Variables</h4>
                  <div className={`gap-3 ${prompt.variables.length >= 4 ? "grid grid-cols-2" : "space-y-3"}`}>
                    {prompt.variables.map((v) => (
                      <div key={v.name}>
                        <label className="text-xs font-medium text-muted-foreground">
                          {variableToLabel(v.name)}
                        </label>
                        <Input
                          className="mt-1"
                          placeholder={v.description}
                          value={variableValues[v.name] ?? ""}
                          onChange={(e) =>
                            setVariableValues((prev) => ({
                              ...prev,
                              [v.name]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="shrink-0 flex items-center gap-2 pt-4 border-t mt-4">
          <button
            className="shrink-0 cursor-pointer text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-md hover:bg-muted"
            onClick={onToggleFavorite}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </button>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={onOpenFullView}
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Full View
          </Button>
          <Button
            className="flex-1 cursor-pointer"
            onClick={() => onCopy(filledText)}
          >
            <Copy className="h-4 w-4 mr-2" />
            {hasVariables ? "Copy Filled Prompt" : "Copy to Clipboard"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
