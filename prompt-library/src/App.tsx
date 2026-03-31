import { useState, useMemo } from "react"
import { Toaster, toast } from "sonner"
import { AppShell } from "@/components/layout/AppShell"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { PromptGrid } from "@/components/prompts/PromptGrid"
import { PromptCard } from "@/components/prompts/PromptCard"
import { PromptTable } from "@/components/prompts/PromptTable"
import { PromptDrawer } from "@/components/prompts/PromptDrawer"
import { PromptDetailView } from "@/components/prompts/PromptDetailView"
import { CategoryPills } from "@/components/prompts/CategoryPills"
import { PromptBundle } from "@/components/prompts/PromptBundle"
import { SubmitPrompt } from "@/components/vision/SubmitPrompt"
import { useTheme } from "@/hooks/useTheme"
import { useFavorites } from "@/hooks/useFavorites"
import { prompts } from "@/data/prompts"
import { teams, getTeamById, getCategoriesForTeam, bundles } from "@/data/teams"
import type { ModelType, Prompt } from "@/data/types"

function App() {
  const { isDark, toggle: toggleTheme } = useTheme()
  const { favorites, toggleFavorite, isFavorite } = useFavorites()

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [showFavorites, setShowFavorites] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"browse" | "detail">("browse")

  // Stash nav state before search so we can restore on clear
  const [preSearchState, setPreSearchState] = useState<{
    selectedTeam: string | null
    selectedCategory: string | null
    showFavorites: boolean
  } | null>(null)

  // Handle team selection — reset category, clear search
  const handleSelectTeam = (teamId: string | null) => {
    setSelectedTeam(teamId)
    setSelectedCategory(null)
    setShowFavorites(false)
    setSearchQuery("")
    setPreSearchState(null)
    setViewMode("browse")
  }

  const handleShowFavorites = () => {
    setShowFavorites(true)
    setSelectedTeam(null)
    setSelectedCategory(null)
    setSearchQuery("")
    setPreSearchState(null)
    setViewMode("browse")
  }

  const handleSearch = (query: string) => {
    if (query && !searchQuery) {
      setPreSearchState({ selectedTeam, selectedCategory, showFavorites })
    }
    setSearchQuery(query)
    if (query) {
      setSelectedTeam(null)
      setShowFavorites(false)
      setSelectedCategory(null)
      setViewMode("browse")
    } else if (preSearchState) {
      setSelectedTeam(preSearchState.selectedTeam)
      setSelectedCategory(preSearchState.selectedCategory)
      setShowFavorites(preSearchState.showFavorites)
      setPreSearchState(null)
    }
  }

  const handleOpenPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setDrawerOpen(true)
  }

  const handleOpenFullView = () => {
    setDrawerOpen(false)
    setViewMode("detail")
  }

  const handleBackToBrowse = () => {
    setViewMode("browse")
  }

  // Open a different prompt in detail view (e.g., from bundle siblings)
  const handleOpenPromptInDetail = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setViewMode("detail")
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard!")
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }

  // Filter prompts
  const filteredPrompts = useMemo(() => {
    let result = prompts

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.promptText.toLowerCase().includes(q) ||
          p.models.some((m) => m.toLowerCase().includes(q))
      )
      if (selectedModel) {
        result = result.filter((p) => p.models.includes(selectedModel))
      }
      return result
    }

    if (showFavorites) {
      result = result.filter((p) => favorites.includes(p.id))
      if (selectedModel) {
        result = result.filter((p) => p.models.includes(selectedModel))
      }
      return result
    }

    if (selectedTeam) {
      result = result.filter((p) => p.teamId === selectedTeam)
    }
    if (selectedCategory) {
      result = result.filter((p) => p.categoryId === selectedCategory)
    }
    if (selectedModel) {
      result = result.filter((p) => p.models.includes(selectedModel))
    }

    return result
  }, [searchQuery, selectedTeam, selectedCategory, selectedModel, showFavorites, favorites])

  // Bundle siblings for the selected prompt
  const bundleSiblings = useMemo(() => {
    if (!selectedPrompt?.bundleId) return []
    const bundle = bundles.find((b) => b.id === selectedPrompt.bundleId)
    if (!bundle) return []
    return prompts.filter(
      (p) => bundle.promptIds.includes(p.id) && p.id !== selectedPrompt.id
    )
  }, [selectedPrompt])

  const categories = selectedTeam ? getCategoriesForTeam(selectedTeam) : []

  const viewTitle = showFavorites
    ? "My Favorites"
    : searchQuery
      ? `Search results for "${searchQuery}"`
      : selectedTeam
        ? getTeamById(selectedTeam)?.name ?? "Prompts"
        : "All Prompts"

  const isCardView = selectedTeam !== null && !searchQuery

  const getTeamName = (teamId: string) => getTeamById(teamId)?.name ?? ""

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            selectedTeam={selectedTeam}
            onSelectTeam={handleSelectTeam}
            showFavorites={showFavorites}
            onShowFavorites={handleShowFavorites}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
            onSubmitPrompt={() => setSubmitOpen(true)}
          />
        }
        header={
          <Header
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />
        }
      >
        {/* Detail view */}
        {viewMode === "detail" && selectedPrompt ? (
          <PromptDetailView
            prompt={selectedPrompt}
            teamName={getTeamName(selectedPrompt.teamId)}
            bundleSiblings={bundleSiblings}
            onBack={handleBackToBrowse}
            onCopy={handleCopy}
            isFavorite={isFavorite(selectedPrompt.id)}
            onToggleFavorite={() => toggleFavorite(selectedPrompt.id)}
            onOpenPrompt={handleOpenPromptInDetail}
            getTeamName={getTeamName}
            isPromptFavorite={isFavorite}
            onTogglePromptFavorite={toggleFavorite}
          />
        ) : (
          /* Browse view */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{viewTitle}</h1>
              <p className="text-sm text-muted-foreground">
                {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? "s" : ""}
              </p>
            </div>

            {isCardView && categories.length > 0 && (
              <CategoryPills
                categories={categories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            )}

            {filteredPrompts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-medium text-muted-foreground">
                  {showFavorites
                    ? "No favorites yet"
                    : searchQuery
                      ? `No prompts found for "${searchQuery}"`
                      : `No prompts for ${getTeamById(selectedTeam ?? "")?.name ?? "this view"} yet`}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {showFavorites
                    ? "Click the heart icon on any prompt to save it here."
                    : searchQuery
                      ? "Try a different search term."
                      : "Be the first to submit one!"}
                </p>
              </div>
            ) : isCardView ? (
              <div className="space-y-6">
                {bundles
                  .filter((b) => b.promptIds.some((pid) => filteredPrompts.some((p) => p.id === pid)))
                  .map((bundle) => {
                    const bundlePrompts = filteredPrompts.filter((p) => bundle.promptIds.includes(p.id))
                    if (bundlePrompts.length === 0) return null
                    return (
                      <PromptBundle key={bundle.id} bundle={bundle}>
                        {bundlePrompts.map((prompt) => (
                          <PromptCard
                            key={prompt.id}
                            prompt={prompt}
                            teamName={getTeamName(prompt.teamId)}
                            onCopy={() => handleCopy(prompt.promptText)}
                            onClick={() => handleOpenPrompt(prompt)}
                            isFavorite={isFavorite(prompt.id)}
                            onToggleFavorite={() => toggleFavorite(prompt.id)}
                          />
                        ))}
                      </PromptBundle>
                    )
                  })}
                <PromptGrid>
                  {filteredPrompts
                    .filter((p) => !bundles.some((b) => b.promptIds.includes(p.id)))
                    .map((prompt) => (
                      <PromptCard
                        key={prompt.id}
                        prompt={prompt}
                        teamName={getTeamName(prompt.teamId)}
                        onCopy={() => handleCopy(prompt.promptText)}
                        onClick={() => handleOpenPrompt(prompt)}
                        isFavorite={isFavorite(prompt.id)}
                        onToggleFavorite={() => toggleFavorite(prompt.id)}
                      />
                    ))}
                </PromptGrid>
              </div>
            ) : (
              <PromptTable
                prompts={filteredPrompts}
                teams={teams}
                onCopy={(prompt) => handleCopy(prompt.promptText)}
                onClick={handleOpenPrompt}
              />
            )}
          </div>
        )}
      </AppShell>

      <PromptDrawer
        prompt={selectedPrompt}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        teamName={selectedPrompt ? getTeamName(selectedPrompt.teamId) : ""}
        onCopy={handleCopy}
        isFavorite={selectedPrompt ? isFavorite(selectedPrompt.id) : false}
        onToggleFavorite={() => selectedPrompt && toggleFavorite(selectedPrompt.id)}
        onOpenFullView={handleOpenFullView}
      />

      <SubmitPrompt open={submitOpen} onOpenChange={setSubmitOpen} />
      <Toaster position="bottom-right" />
    </>
  )
}

export default App
