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
  Heart,
  TrendingUp,
  History,
  BarChart3,
  GitCommit,
  ChevronDown,
  ChevronUp,
  Maximize2,
  X,
  Link2,
} from "lucide-react"
import { CopyButton } from "@/components/prompts/AiPlatformButtons"
import { PromptContent } from "@/components/prompts/PromptContent"
import { getTagColor } from "@/lib/tag-colors"
import { fillVariables, variableToLabel, extractVariablesWithPlaceholders } from "@/lib/variables"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"
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

  // Extract inline placeholders from prompt text; fall back to Variable.description
  const inlinePlaceholders = useMemo(() => {
    if (!prompt) return []
    return extractVariablesWithPlaceholders(prompt.promptText)
  }, [prompt])
  const getPlaceholder = (v: { name: string; description: string }) => {
    const inline = inlinePlaceholders.find((ip) => ip.name === v.name)
    return inline?.placeholder || v.description || ""
  }

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
            {prompt.tags.map((tag) => (
              <Badge key={tag} variant="outline" className={`text-[10px] px-1.5 py-0 ${getTagColor(tag)}`}>
                {tag}
              </Badge>
            ))}
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
              <PromptContent text={filledText} onCopy={onCopy} />
            </div>

            {/* Variable inputs */}
            {hasVariables && (
              <>
                <Separator />
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-sm font-medium mb-3 cursor-help w-fit text-left">
                        Fill in Variables
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Replace the placeholders with your own values</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className={`gap-3 ${prompt.variables.length >= 4 ? "grid grid-cols-2" : "space-y-3"}`}>
                    {prompt.variables.map((v) => (
                      <div key={v.name}>
                        <label className="text-xs font-medium text-muted-foreground">
                          {variableToLabel(v.name)}
                        </label>
                        <Input
                          className="mt-1"
                          placeholder={getPlaceholder(v) || `Enter ${variableToLabel(v.name).toLowerCase()}...`}
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
            size="icon"
            className="cursor-pointer shrink-0"
            title="Share link"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(`${window.location.origin}/prompts/${prompt.id}`)
                toast.success("Link copied to clipboard!")
              } catch {
                toast.error("Failed to copy link")
              }
            }}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={onOpenFullView}
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Full View
          </Button>
          <CopyButton text={filledText} onCopy={onCopy} size="sm" label={hasVariables ? "Copy Filled Prompt" : "Copy"} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
