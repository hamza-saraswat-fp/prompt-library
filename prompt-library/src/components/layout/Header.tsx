import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, X, Sun, Moon, SlidersHorizontal } from "lucide-react"
import type { ModelType } from "@/data/types"

const models: (ModelType | "All")[] = ["All", "ChatGPT", "Claude", "Gemini", "Model-Agnostic"]

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedModel: ModelType | null
  onModelChange: (model: ModelType | null) => void
  isDark: boolean
  onToggleTheme: () => void
}

export function Header({
  searchQuery,
  onSearchChange,
  selectedModel,
  onModelChange,
  isDark,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-border bg-background px-6 py-3">
      {/* Search */}
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

      {/* Model Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
          <SlidersHorizontal className="h-4 w-4" />
          {selectedModel ?? "All Models"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {models.map((model) => (
            <DropdownMenuItem
              key={model}
              onClick={() => onModelChange(model === "All" ? null : model)}
              className="cursor-pointer"
            >
              {model === "All" ? "All Models" : model}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleTheme}
        className="cursor-pointer"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </header>
  )
}
