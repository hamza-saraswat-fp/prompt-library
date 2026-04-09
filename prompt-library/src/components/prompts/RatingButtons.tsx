import { ThumbsUp, ThumbsDown } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import type { RatingInfo } from "@/hooks/useRatings"

interface RatingButtonsProps {
  promptId: string
  rating: RatingInfo
  onVote: (promptId: string, direction: "up" | "down") => void
  size?: "sm" | "default"
}

function formatScore(net: number): string {
  if (net > 0) return `+${net}`
  return String(net)
}

export function RatingButtons({ promptId, rating, onVote, size = "default" }: RatingButtonsProps) {
  const { user } = useAuth()
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
  const textSize = size === "sm" ? "text-xs" : "text-sm"

  const handleVote = (e: React.MouseEvent, direction: "up" | "down") => {
    e.stopPropagation()
    if (!user) {
      toast.info("Sign in to vote on prompts")
      return
    }
    onVote(promptId, direction)
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        className={`cursor-pointer transition-colors ${
          rating.userVote === "up"
            ? "text-emerald-500"
            : "text-muted-foreground hover:text-emerald-500"
        }`}
        onClick={(e) => handleVote(e, "up")}
      >
        <ThumbsUp
          className={`${iconSize} ${rating.userVote === "up" ? "fill-emerald-500" : ""}`}
        />
      </button>
      <span className={`${textSize} tabular-nums text-muted-foreground min-w-[1.5ch] text-center`}>
        {formatScore(rating.net)}
      </span>
      <button
        className={`cursor-pointer transition-colors ${
          rating.userVote === "down"
            ? "text-red-500"
            : "text-muted-foreground hover:text-red-500"
        }`}
        onClick={(e) => handleVote(e, "down")}
      >
        <ThumbsDown
          className={`${iconSize} ${rating.userVote === "down" ? "fill-red-500" : ""}`}
        />
      </button>
    </span>
  )
}
