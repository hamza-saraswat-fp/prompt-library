import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Search, X, Sun, Moon, Tag, Check, LayoutGrid, Table, ArrowUpDown } from "lucide-react"
import { UserMenu } from "@/components/auth/UserMenu"
import { TAGS } from "@/data/types"
import type { Department } from "@/data/types"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedDepartments: Department[]
  onDepartmentChange: (departments: Department[]) => void
  selectedTags: string[]
  onTagChange: (tags: string[]) => void
  viewPreference: "cards" | "table"
  onViewPreferenceChange: (pref: "cards" | "table") => void
  isDark: boolean
  onToggleTheme: () => void
  isHomeView?: boolean
  sortField?: "title" | "rating" | null
  onSort?: (field: "title" | "rating") => void
}

export function Header({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagChange,
  viewPreference,
  onViewPreferenceChange,
  isDark,
  onToggleTheme,
  isHomeView,
  sortField,
  onSort,
}: HeaderProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagChange([...selectedTags, tag])
    }
  }

  return (
    <header className="flex items-center gap-3 border-b border-border bg-background px-6 py-3">
      {/* Search — hidden on home view since hero search replaces it */}
      {!isHomeView && (
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Spacer when search is hidden */}
      {isHomeView && <div className="flex-1" />}

      {/* Tag Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
          <Tag className="h-4 w-4" />
          {selectedTags.length > 0
            ? `Tags (${selectedTags.length})`
            : "All Tags"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto">
          {selectedTags.length > 0 && (
            <>
              <DropdownMenuItem
                onClick={() => onTagChange([])}
                className="cursor-pointer text-muted-foreground"
              >
                Clear all
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {TAGS.map((tag) => (
            <DropdownMenuItem
              key={tag}
              onClick={() => toggleTag(tag)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <div className={`h-4 w-4 flex items-center justify-center rounded border ${
                  selectedTags.includes(tag)
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-input"
                }`}>
                  {selectedTags.includes(tag) && <Check className="h-3 w-3" />}
                </div>
                {tag}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort — hidden on home view */}
      {!isHomeView && onSort && (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
            <ArrowUpDown className="h-4 w-4" />
            {sortField === "title" ? "Title" : sortField === "rating" ? "Top Rated" : "Sort"}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => { if (sortField) onSort(sortField) }}
              className={`cursor-pointer ${!sortField ? "text-muted-foreground" : ""}`}
              disabled={!sortField}
            >
              Default
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onSort("title")}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                {sortField === "title" && <Check className="h-3 w-3" />}
                <span className={sortField === "title" ? "font-medium" : ""}>Title</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSort("rating")}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                {sortField === "rating" && <Check className="h-3 w-3" />}
                <span className={sortField === "rating" ? "font-medium" : ""}>Top Rated</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* View Toggle — hidden on home view */}
      {!isHomeView && (
        <div className="flex items-center rounded-md border border-input">
          <Button
            variant={viewPreference === "cards" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-r-none cursor-pointer"
            onClick={() => onViewPreferenceChange("cards")}
            title="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewPreference === "table" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-l-none cursor-pointer"
            onClick={() => onViewPreferenceChange("table")}
            title="Table view"
          >
            <Table className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleTheme}
        className="cursor-pointer"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* User Menu */}
      <UserMenu />
    </header>
  )
}
