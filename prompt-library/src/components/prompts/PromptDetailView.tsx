import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { PromptCard } from "@/components/prompts/PromptCard"
import {
  ArrowLeft,
  Copy,
  Heart,
  TrendingUp,
  Clock,
  BarChart3,
  GitCommit,
} from "lucide-react"
import {
  fillVariables,
  variableToLabel,
  segmentPromptText,
} from "@/lib/variables"
import { modelColors } from "@/lib/constants"
import type { Prompt } from "@/data/types"

interface PromptDetailViewProps {
  prompt: Prompt
  teamName: string
  bundleSiblings: Prompt[]
  onBack: () => void
  onCopy: (text: string) => void
  isFavorite: boolean
  onToggleFavorite: () => void
  onOpenPrompt: (prompt: Prompt) => void
  getTeamName: (teamId: string) => string
  isPromptFavorite: (id: string) => boolean
  onTogglePromptFavorite: (id: string) => void
}

export function PromptDetailView({
  prompt,
  teamName,
  bundleSiblings,
  onBack,
  onCopy,
  isFavorite,
  onToggleFavorite,
  onOpenPrompt,
  getTeamName,
  isPromptFavorite,
  onTogglePromptFavorite,
}: PromptDetailViewProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  )

  const filledText = useMemo(
    () => fillVariables(prompt.promptText, variableValues),
    [prompt, variableValues]
  )

  const segments = useMemo(
    () => segmentPromptText(filledText),
    [filledText]
  )

  const hasVariables = prompt.variables.length > 0

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        className="cursor-pointer -ml-2 text-muted-foreground hover:text-foreground"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to prompts
      </Button>

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{prompt.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {prompt.models.map((model) => (
              <Badge
                key={model}
                className={`text-xs px-2 py-0.5 ${modelColors[model] ?? ""}`}
              >
                {model}
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {teamName}
            </Badge>
            {prompt.status === "pending" && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 border-yellow-500 text-yellow-600 dark:text-yellow-400"
              >
                <Clock className="h-3 w-3 mr-1" />
                Pending Review
              </Badge>
            )}
          </div>
        </div>
        <button
          className="shrink-0 cursor-pointer text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-md hover:bg-muted"
          onClick={onToggleFavorite}
        >
          <Heart
            className={`h-6 w-6 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
          />
        </button>
      </div>

      {/* Description */}
      <p className="text-base text-muted-foreground max-w-3xl">
        {prompt.description}
      </p>

      {/* Metadata bar */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          v{prompt.version}
        </span>
        <span className="text-border">|</span>
        <span className="flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4" />
          {prompt.copyCount} copies this month
        </span>
        {prompt.isTrending && (
          <>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1.5 text-orange-500">
              <TrendingUp className="h-4 w-4" />
              Trending
            </span>
          </>
        )}
        <span className="text-border">|</span>
        <span>by {prompt.author}</span>
        <span className="text-border">|</span>
        <span>Updated {prompt.updatedAt}</span>
      </div>

      <Separator />

      {/* Main body — two-column when variables, single when not */}
      {hasVariables ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Prompt text */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Prompt Template</h2>
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer text-muted-foreground"
                onClick={() => onCopy(prompt.promptText)}
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy raw
              </Button>
            </div>
            <div className="rounded-lg bg-muted p-6 text-sm font-mono whitespace-pre-wrap leading-relaxed">
              {segments.map((seg) =>
                seg.isVariable ? (
                  <span
                    key={seg.key}
                    className="rounded bg-primary/10 px-1 py-0.5 text-primary font-medium"
                  >
                    {seg.text}
                  </span>
                ) : (
                  <span key={seg.key}>{seg.text}</span>
                )
              )}
            </div>
          </div>

          {/* Right: Variables + Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 space-y-6">
              {/* Variable inputs */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Fill in Variables</h2>
                <div className="space-y-3">
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

              {/* Copy button */}
              <Button
                className="w-full cursor-pointer"
                onClick={() => onCopy(filledText)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Filled Prompt
              </Button>

            </div>
          </div>
        </div>
      ) : (
        /* Single column — no variables */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Prompt</h2>
            <Button
              className="cursor-pointer"
              onClick={() => onCopy(prompt.promptText)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>
          <div className="rounded-lg bg-muted p-6 text-sm font-mono whitespace-pre-wrap leading-relaxed max-w-4xl">
            {prompt.promptText}
          </div>
        </div>
      )}

      <Separator />

      {/* Version History — always expanded */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Version History</h2>
        <div className="space-y-4 max-w-2xl">
          {prompt.versionHistory.map((entry, i) => (
            <div key={entry.version} className="relative flex gap-3">
              {i < prompt.versionHistory.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
              )}
              <div className="mt-0.5 shrink-0">
                <GitCommit className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">v{entry.version}</span>
                  {i === 0 && (
                    <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {entry.changeDescription}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {entry.author} &middot; {entry.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Prompts in Bundle */}
      {bundleSiblings.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold mb-4">Also in this bundle</h2>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {bundleSiblings.map((sibling) => (
                <PromptCard
                  key={sibling.id}
                  prompt={sibling}
                  teamName={getTeamName(sibling.teamId)}
                  onCopy={() => onCopy(sibling.promptText)}
                  onClick={() => onOpenPrompt(sibling)}
                  isFavorite={isPromptFavorite(sibling.id)}
                  onToggleFavorite={() => onTogglePromptFavorite(sibling.id)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
