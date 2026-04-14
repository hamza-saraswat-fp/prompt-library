import { HeroSearch } from "./HeroSearch"
import { BundleCarousel } from "./BundleCarousel"
import { RecentlyUsedCarousel } from "./RecentlyUsedCarousel"
import { PromptFeed } from "./PromptFeed"
import type { Prompt, Bundle, Category } from "@/data/types"

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
  getCategoryById: (id: string) => Category | undefined
  allTags: string[]
  selectedTags: string[]
  onTagChange: (tags: string[]) => void
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
  getCategoryById,
  allTags,
  selectedTags,
  onTagChange,
}: HomePageProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagChange([...selectedTags, tag])
    }
  }

  return (
    <div className="space-y-8 min-w-0">
      <HeroSearch searchQuery={searchQuery} onSearchChange={onSearchChange} />
      {!searchQuery && <BundleCarousel bundles={bundles} onBundleClick={onBundleClick} />}
      {!searchQuery && <RecentlyUsedCarousel prompts={recentPrompts} onOpenPrompt={onOpenPrompt} getCategoryById={getCategoryById} />}

      {/* Tag pills for quick filtering — sits right above Recommended Prompts */}
      {!searchQuery && allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-4">
          {selectedTags.length > 0 && (
            <button
              onClick={() => onTagChange([])}
              className="cursor-pointer rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              Clear filters
            </button>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <PromptFeed
        prompts={prompts}
        searchQuery={searchQuery}
        onOpenPrompt={onOpenPrompt}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
        onCopy={onCopy}
        onInteraction={onInteraction}
      />
    </div>
  )
}
