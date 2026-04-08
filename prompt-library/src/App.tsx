import { useState, useMemo, useCallback } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { Toaster, toast } from "sonner"
import { AppShell } from "@/components/layout/AppShell"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { PromptGrid } from "@/components/prompts/PromptGrid"
import { PromptCard } from "@/components/prompts/PromptCard"
import { PromptTable } from "@/components/prompts/PromptTable"
import { PromptDrawer } from "@/components/prompts/PromptDrawer"
import { CategoryPills } from "@/components/prompts/CategoryPills"
import { PromptBundle } from "@/components/prompts/PromptBundle"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { HomePage } from "@/components/home/HomePage"
import { SubmitPrompt } from "@/components/vision/SubmitPrompt"
import { PromptPage } from "@/pages/PromptPage"
import { useTheme } from "@/hooks/useTheme"
import { useFavorites } from "@/hooks/useFavorites"
import { useRecentlyUsed } from "@/hooks/useRecentlyUsed"
import { useRatings } from "@/hooks/useRatings"
import { prompts } from "@/data/prompts"
import { getGroupById, getCategoriesForGroup, bundles } from "@/data/teams"
import type { Prompt, Department } from "@/data/types"

function BrowsePage({
  filteredPrompts,
  viewTitle,
  isCardView,
  selectedGroup,
  categories,
  selectedCategory,
  setSelectedCategory,
  showFavorites,
  searchQuery,
  handleOpenPrompt,
  isFavorite,
  toggleFavorite,
  sortField,
  sortDirection,
  onSort,
}: {
  filteredPrompts: Prompt[]
  viewTitle: string
  isCardView: boolean
  selectedGroup: string | null
  categories: { id: string; name: string; groupId: string }[]
  selectedCategory: string | null
  setSelectedCategory: (id: string | null) => void
  showFavorites: boolean
  searchQuery: string
  handleOpenPrompt: (prompt: Prompt) => void
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  sortField: "title" | "rating" | null
  sortDirection: "asc" | "desc"
  onSort: (field: "title" | "rating") => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{viewTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {isCardView && selectedGroup && categories.length > 0 && (
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
          {selectedGroup && bundles
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
              .filter((p) => !selectedGroup || !bundles.some((b) => b.promptIds.includes(p.id)))
              .map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
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
          onClick={handleOpenPrompt}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
      )}
    </div>
  )
}

function App() {
  const navigate = useNavigate()
  const { isDark, toggle: toggleTheme } = useTheme()
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { recentIds, addRecent } = useRecentlyUsed()
  const { getRating, vote, getNetScore } = useRatings()

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [showFavorites, setShowFavorites] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [sortField, setSortField] = useState<"title" | "rating" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [activeView, setActiveView] = useState<"home" | "browse">("home")
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null)
  const [viewPreference, setViewPreference] = useState<"cards" | "table">(() =>
    (localStorage.getItem("view-pref") as "cards" | "table") || "cards"
  )

  const handleViewPreferenceChange = useCallback((pref: "cards" | "table") => {
    setViewPreference(pref)
    localStorage.setItem("view-pref", pref)
  }, [])

  // Stash nav state before search so we can restore on clear
  const [preSearchState, setPreSearchState] = useState<{
    selectedGroup: string | null
    selectedCategory: string | null
    selectedDepartments: Department[]
    selectedTags: string[]
    showFavorites: boolean
  } | null>(null)

  const handleSelectGroup = (groupId: string | null) => {
    setSelectedGroup(groupId)
    setSelectedCategory(null)
    setShowFavorites(false)
    setSearchQuery("")
    setPreSearchState(null)
    setSelectedBundleId(null)
    setActiveView("browse")
    navigate("/")
  }

  const handleShowFavorites = () => {
    setShowFavorites(true)
    setSelectedGroup(null)
    setSelectedCategory(null)
    setSearchQuery("")
    setPreSearchState(null)
    setSelectedBundleId(null)
    setActiveView("browse")
    navigate("/")
  }

  const handleGoHome = () => {
    setActiveView("home")
    setSelectedGroup(null)
    setSelectedCategory(null)
    setShowFavorites(false)
    setSearchQuery("")
    setPreSearchState(null)
    setSelectedBundleId(null)
    navigate("/")
  }

  const handleBundleClick = (bundleId: string) => {
    setSelectedBundleId(bundleId)
    setActiveView("browse")
    setSelectedGroup(null)
    setShowFavorites(false)
    setSearchQuery("")
    setPreSearchState(null)
    navigate("/")
  }

  const handleSearch = (query: string) => {
    if (query && !searchQuery) {
      setPreSearchState({ selectedGroup, selectedCategory, selectedDepartments, selectedTags, showFavorites })
    }
    setSearchQuery(query)
    if (query) {
      setSelectedGroup(null)
      setShowFavorites(false)
      setSelectedCategory(null)
    } else if (preSearchState) {
      setSelectedGroup(preSearchState.selectedGroup)
      setSelectedCategory(preSearchState.selectedCategory)
      setSelectedDepartments(preSearchState.selectedDepartments)
      setSelectedTags(preSearchState.selectedTags)
      setShowFavorites(preSearchState.showFavorites)
      setPreSearchState(null)
    }
  }

  const handleOpenPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setDrawerOpen(true)
    addRecent(prompt.id)
  }

  const handleOpenFullView = () => {
    if (selectedPrompt) {
      setDrawerOpen(false)
      navigate(`/prompts/${selectedPrompt.id}`)
    }
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
    const matchesTags = (p: Prompt) =>
      selectedTags.length === 0 || p.tags.some((t) => selectedTags.includes(t))

    let result = prompts

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.overview.toLowerCase().includes(q) ||
          p.promptText.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
      return result.filter(matchesTags)
    }

    if (showFavorites) {
      result = result.filter((p) => favorites.includes(p.id))
      return result.filter(matchesTags)
    }

    if (selectedBundleId) {
      const bundle = bundles.find((b) => b.id === selectedBundleId)
      if (bundle) {
        result = result.filter((p) => bundle.promptIds.includes(p.id))
      }
      return result.filter(matchesTags)
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

    return result.filter(matchesTags)
  }, [searchQuery, selectedGroup, selectedCategory, selectedTags, showFavorites, favorites, selectedBundleId])

  const sortedPrompts = useMemo(() => {
    if (!sortField) return filteredPrompts
    if (sortField === "rating") {
      return [...filteredPrompts].sort((a, b) => {
        const cmp = getNetScore(b.id) - getNetScore(a.id)
        return sortDirection === "asc" ? cmp : -cmp
      })
    }
    return [...filteredPrompts].sort((a, b) => {
      const cmp = a.title.localeCompare(b.title)
      return sortDirection === "asc" ? cmp : -cmp
    })
  }, [filteredPrompts, sortField, sortDirection, getNetScore])

  const handleSort = (field: "title" | "rating") => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else {
        setSortField(null)
        setSortDirection("asc")
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const categories = selectedGroup ? getCategoriesForGroup(selectedGroup) : []

  const viewTitle = showFavorites
    ? "My Favorites"
    : searchQuery
      ? `Search results for "${searchQuery}"`
      : selectedBundleId
        ? bundles.find((b) => b.id === selectedBundleId)?.name ?? "Bundle"
        : selectedGroup
          ? getGroupById(selectedGroup)?.name ?? "Prompts"
          : "All Prompts"

  const recentPrompts = useMemo(() =>
    recentIds.map((id) => prompts.find((p) => p.id === id)).filter(Boolean) as Prompt[],
    [recentIds]
  )

  const isCardView = viewPreference === "cards"

  return (
    <AuthGuard>
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
            onGoHome={handleGoHome}
            activeView={activeView}
          />
        }
        header={
          <Header
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            selectedDepartments={selectedDepartments}
            onDepartmentChange={setSelectedDepartments}
            selectedTags={selectedTags}
            onTagChange={setSelectedTags}
            viewPreference={viewPreference}
            onViewPreferenceChange={handleViewPreferenceChange}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            sortField={sortField}
            onSort={handleSort}
            isHomeView={activeView === "home"}
          />
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              activeView === "home" ? (
                <HomePage
                  searchQuery={searchQuery}
                  onSearchChange={handleSearch}
                  bundles={bundles}
                  onBundleClick={handleBundleClick}
                  prompts={sortedPrompts}
                  recentPrompts={recentPrompts}
                  onOpenPrompt={handleOpenPrompt}
                  isFavorite={isFavorite}
                  toggleFavorite={toggleFavorite}
                  onCopy={handleCopy}
                  onInteraction={addRecent}
                  getRating={getRating}
                  onVote={vote}
                />
              ) : (
                <BrowsePage
                  filteredPrompts={sortedPrompts}
                  viewTitle={viewTitle}
                  isCardView={isCardView}
                  selectedGroup={selectedGroup}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  showFavorites={showFavorites}
                  searchQuery={searchQuery}
                  handleOpenPrompt={handleOpenPrompt}
                  isFavorite={isFavorite}
                  toggleFavorite={toggleFavorite}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              )
            }
          />
          <Route path="/prompts/:id" element={<PromptPage />} />
        </Routes>
      </AppShell>

      <PromptDrawer
        prompt={selectedPrompt}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onCopy={handleCopy}
        isFavorite={selectedPrompt ? isFavorite(selectedPrompt.id) : false}
        onToggleFavorite={() => selectedPrompt && toggleFavorite(selectedPrompt.id)}
        onOpenFullView={handleOpenFullView}
        rating={selectedPrompt ? getRating(selectedPrompt.id) : { up: 0, down: 0, userVote: null, net: 0 }}
        onVote={vote}
      />

      <SubmitPrompt open={submitOpen} onOpenChange={setSubmitOpen} />
      <Toaster position="bottom-right" />
    </AuthGuard>
  )
}

export default App
