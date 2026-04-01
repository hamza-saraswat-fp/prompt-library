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
import { getGroupById, getCategoriesForGroup, bundles } from "@/data/teams"
import type { ModelType, Prompt, Department } from "@/data/types"

function App() {
  const { isDark, toggle: toggleTheme } = useTheme()
  const { favorites, toggleFavorite, isFavorite } = useFavorites()

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [showFavorites, setShowFavorites] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null)
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"browse" | "detail">("browse")

  // Stash nav state before search so we can restore on clear
  const [preSearchState, setPreSearchState] = useState<{
    selectedGroup: string | null
    selectedCategory: string | null
    selectedDepartments: Department[]
    showFavorites: boolean
  } | null>(null)

  // Handle group selection — reset category, clear search
  const handleSelectGroup = (groupId: string | null) => {
    setSelectedGroup(groupId)
    setSelectedCategory(null)
    setShowFavorites(false)
    setSearchQuery("")
    setPreSearchState(null)
    setViewMode("browse")
  }

  const handleShowFavorites = () => {
    setShowFavorites(true)
    setSelectedGroup(null)
    setSelectedCategory(null)
    setSearchQuery("")
    setPreSearchState(null)
    setViewMode("browse")
  }

  const handleSearch = (query: string) => {
    if (query && !searchQuery) {
      setPreSearchState({ selectedGroup, selectedCategory, selectedDepartments, showFavorites })
    }
    setSearchQuery(query)
    if (query) {
      setSelectedGroup(null)
      setShowFavorites(false)
      setSelectedCategory(null)
      setViewMode("browse")
    } else if (preSearchState) {
      setSelectedGroup(preSearchState.selectedGroup)
      setSelectedCategory(preSearchState.selectedCategory)
      setSelectedDepartments(preSearchState.selectedDepartments)
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

  // Department filter helper
  const matchesDepartments = (prompt: Prompt) => {
    if (selectedDepartments.length === 0) return true
    return prompt.departments.some((d) => selectedDepartments.includes(d))
  }

  // Filter prompts
  const filteredPrompts = useMemo(() => {
    let result = prompts

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.overview.toLowerCase().includes(q) ||
          p.promptText.toLowerCase().includes(q) ||
          p.models.some((m) => m.toLowerCase().includes(q))
      )
      if (selectedModel) {
        result = result.filter((p) => p.models.includes(selectedModel))
      }
      if (selectedDepartments.length > 0) {
        result = result.filter(matchesDepartments)
      }
      return result
    }

    if (showFavorites) {
      result = result.filter((p) => favorites.includes(p.id))
      if (selectedModel) {
        result = result.filter((p) => p.models.includes(selectedModel))
      }
      if (selectedDepartments.length > 0) {
        result = result.filter(matchesDepartments)
      }
      return result
    }

    if (selectedGroup) {
      const group = getGroupById(selectedGroup)
      if (group) {
        result = result.filter((p) => group.categoryIds.includes(p.categoryId))
      }
    }
    if (selectedCategory) {
      result = result.filter((p) => p.categoryId === selectedCategory)
    }
    if (selectedModel) {
      result = result.filter((p) => p.models.includes(selectedModel))
    }
    if (selectedDepartments.length > 0) {
      result = result.filter(matchesDepartments)
    }

    return result
  }, [searchQuery, selectedGroup, selectedCategory, selectedModel, selectedDepartments, showFavorites, favorites])

  // Bundle siblings for the selected prompt
  const bundleSiblings = useMemo(() => {
    if (!selectedPrompt?.bundleId) return []
    const bundle = bundles.find((b) => b.id === selectedPrompt.bundleId)
    if (!bundle) return []
    return prompts.filter(
      (p) => bundle.promptIds.includes(p.id) && p.id !== selectedPrompt.id
    )
  }, [selectedPrompt])

  const categories = selectedGroup ? getCategoriesForGroup(selectedGroup) : []

  const viewTitle = showFavorites
    ? "My Favorites"
    : searchQuery
      ? `Search results for "${searchQuery}"`
      : selectedGroup
        ? getGroupById(selectedGroup)?.name ?? "Prompts"
        : "All Prompts"

  // Card view for group browse and favorites; table for All Prompts and search
  const isCardView = (selectedGroup !== null || showFavorites) && !searchQuery

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            selectedGroup={selectedGroup}
            onSelectGroup={handleSelectGroup}
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
            selectedDepartments={selectedDepartments}
            onDepartmentChange={setSelectedDepartments}
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />
        }
      >
        {/* Detail view */}
        {viewMode === "detail" && selectedPrompt ? (
          <PromptDetailView
            prompt={selectedPrompt}
            bundleSiblings={bundleSiblings}
            onBack={handleBackToBrowse}
            onCopy={handleCopy}
            isFavorite={isFavorite(selectedPrompt.id)}
            onToggleFavorite={() => toggleFavorite(selectedPrompt.id)}
            onOpenPrompt={handleOpenPromptInDetail}
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
                      : "No prompts match your filters"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {showFavorites
                    ? "Click the heart icon on any prompt to save it here."
                    : searchQuery
                      ? "Try a different search term."
                      : "Try broadening your selection."}
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
