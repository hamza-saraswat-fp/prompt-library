import { useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PromptDetailView } from "@/components/prompts/PromptDetailView"
import { prompts } from "@/data/prompts"
import { bundles } from "@/data/teams"
import { useFavorites } from "@/hooks/useFavorites"
import { useRatings } from "@/hooks/useRatings"
import { toast } from "sonner"
import { Link2, ArrowLeft } from "lucide-react"

export function PromptPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { getRating, vote } = useRatings()

  const prompt = prompts.find((p) => p.id === id)

  const bundleSiblings = useMemo(() => {
    if (!prompt?.bundleId) return []
    const bundle = bundles.find((b) => b.id === prompt.bundleId)
    if (!bundle) return []
    return prompts.filter(
      (p) => bundle.promptIds.includes(p.id) && p.id !== prompt.id
    )
  }, [prompt])

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
      {/* Navigation bar */}
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
        rating={getRating(prompt.id)}
        onVote={vote}
      />
    </div>
  )
}
