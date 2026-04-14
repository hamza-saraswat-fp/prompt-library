import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PromptDetailView } from "@/components/prompts/PromptDetailView"
import { supabase } from "@/lib/supabase"
import { useFavorites } from "@/hooks/useFavorites"
import { initTagColors } from "@/lib/tag-colors"
import { toast } from "sonner"
import { Link2, ArrowLeft, Loader2 } from "lucide-react"
import type { Prompt } from "@/data/types"

function toPrompt(row: Record<string, unknown>): Prompt {
  return {
    id: row.id as string,
    title: row.title as string,
    overview: row.overview as string,
    promptText: row.prompt_text as string,
    departments: row.departments as Prompt["departments"],
    categoryId: row.category_id as string,
    models: row.models as Prompt["models"],
    variables: row.variables as Prompt["variables"],
    tags: row.tags as string[],
    version: row.version as number,
    copyCount: row.copy_count as number,
    isTrending: row.is_trending as boolean,
    bundleId: (row.bundle_id as string) ?? undefined,
    author: row.author as string,
    versionHistory: row.version_history as Prompt["versionHistory"],
    useCases: (row.use_cases as Prompt["useCases"]) ?? undefined,
    comments: (row.comments as Prompt["comments"]) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function PromptPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()

  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [bundleSiblings, setBundleSiblings] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrompt() {
      if (!id) return

      // Init tag colors
      const { data: tags } = await supabase.from("tags").select("id, type")
      if (tags) {
        initTagColors(tags.filter((t) => t.type === "department").map((t) => t.id))
      }

      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !data) {
        setPrompt(null)
        setLoading(false)
        return
      }

      const p = toPrompt(data)
      setPrompt(p)

      // Fetch bundle siblings if this prompt is in a bundle
      if (p.bundleId) {
        const { data: siblings } = await supabase
          .from("prompts")
          .select("*")
          .eq("bundle_id", p.bundleId)
          .neq("id", p.id)

        if (siblings) {
          setBundleSiblings(siblings.map(toPrompt))
        }
      }

      setLoading(false)
    }

    fetchPrompt()
  }, [id])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard!")
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    } catch {
      toast.error("Failed to copy link")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-muted-foreground">Prompt not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The prompt you're looking for doesn't exist or has been removed.
        </p>
        <Button
          variant="outline"
          className="mt-4 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to prompts
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="cursor-pointer -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to prompts
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={handleShare}
        >
          <Link2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      <PromptDetailView
        prompt={prompt}
        bundleSiblings={bundleSiblings}
        onCopy={handleCopy}
        isFavorite={isFavorite(prompt.id)}
        onToggleFavorite={() => toggleFavorite(prompt.id)}
        onOpenPrompt={(p) => navigate(`/prompts/${p.id}`)}
        isPromptFavorite={isFavorite}
        onTogglePromptFavorite={toggleFavorite}
      />
    </div>
  )
}
