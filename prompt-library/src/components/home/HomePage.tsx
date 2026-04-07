import { HeroSearch } from "./HeroSearch"
import { BundleCarousel } from "./BundleCarousel"
import { RecentlyUsedCarousel } from "./RecentlyUsedCarousel"
import { PromptFeed } from "./PromptFeed"
import type { Prompt, Bundle } from "@/data/types"
import type { RatingInfo } from "@/hooks/useRatings"

interface HomePageProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  bundles: Bundle[]
  onBundleClick: (bundleId: string) => void
  prompts: Prompt[]
  recentPrompts: Prompt[]
  onOpenPrompt: (prompt: Prompt) => void
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  onCopy: (text: string) => void
  onInteraction: (promptId: string) => void
  getRating: (promptId: string) => RatingInfo
  onVote: (promptId: string, direction: "up" | "down") => void
}

export function HomePage({
  searchQuery,
  onSearchChange,
  bundles,
  onBundleClick,
  prompts,
  recentPrompts,
  onOpenPrompt,
  isFavorite,
  toggleFavorite,
  onCopy,
  onInteraction,
  getRating,
  onVote,
}: HomePageProps) {
  return (
    <div className="space-y-8 min-w-0">
      <HeroSearch searchQuery={searchQuery} onSearchChange={onSearchChange} />
      {!searchQuery && <BundleCarousel bundles={bundles} onBundleClick={onBundleClick} />}
      {!searchQuery && <RecentlyUsedCarousel prompts={recentPrompts} onOpenPrompt={onOpenPrompt} />}
      <PromptFeed
        prompts={prompts}
        searchQuery={searchQuery}
        onOpenPrompt={onOpenPrompt}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
        onCopy={onCopy}
        onInteraction={onInteraction}
        getRating={getRating}
        onVote={onVote}
      />
    </div>
  )
}
