import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PromptContentProps {
  text: string
  onCopy: (text: string) => void
}

export function PromptContent({ text, onCopy }: PromptContentProps) {
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted")
  const [copied, setCopied] = useState(false)

  const handleCopyRaw = () => {
    onCopy(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-md border border-border p-0.5 text-xs">
          <button
            className={`cursor-pointer rounded-sm px-2.5 py-1 transition-colors ${
              viewMode === "formatted"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setViewMode("formatted")}
          >
            Formatted
          </button>
          <button
            className={`cursor-pointer rounded-sm px-2.5 py-1 transition-colors ${
              viewMode === "raw"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setViewMode("raw")}
          >
            Raw
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "formatted" ? (
        <div className="prompt-markdown rounded-lg bg-muted p-6 text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      ) : (
        <div className="relative">
          <pre className="rounded-lg bg-muted p-6 text-sm font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
            <code>{text}</code>
          </pre>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-7 px-2 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={handleCopyRaw}
          >
            {copied ? (
              <><Check className="h-3.5 w-3.5 mr-1" />Copied</>
            ) : (
              <><Copy className="h-3.5 w-3.5 mr-1" />Copy</>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
