import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Search, X, Sun, Moon, SlidersHorizontal, Building2, Check } from "lucide-react"
import { DEPARTMENTS } from "@/data/types"
import type { ModelType, Department } from "@/data/types"

const models: (ModelType | "All")[] = ["All", "ChatGPT", "Claude", "Gemini", "Model-Agnostic"]

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedModel: ModelType | null
  onModelChange: (model: ModelType | null) => void
  selectedDepartments: Department[]
  onDepartmentChange: (departments: Department[]) => void
  isDark: boolean
  onToggleTheme: () => void
}

export function Header({
  searchQuery,
  onSearchChange,
  selectedModel,
  onModelChange,
  selectedDepartments,
  onDepartmentChange,
  isDark,
  onToggleTheme,
}: HeaderProps) {
  const toggleDepartment = (dept: Department) => {
    if (selectedDepartments.includes(dept)) {
      onDepartmentChange(selectedDepartments.filter((d) => d !== dept))
    } else {
      onDepartmentChange([...selectedDepartments, dept])
    }
  }

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

      {/* Department Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
          <Building2 className="h-4 w-4" />
          {selectedDepartments.length > 0
            ? `Departments (${selectedDepartments.length})`
            : "All Departments"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {selectedDepartments.length > 0 && (
            <>
              <DropdownMenuItem
                onClick={() => onDepartmentChange([])}
                className="cursor-pointer text-muted-foreground"
              >
                Clear all
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {DEPARTMENTS.map((dept) => (
            <DropdownMenuItem
              key={dept}
              onClick={() => toggleDepartment(dept)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <div className={`h-4 w-4 flex items-center justify-center rounded border ${
                  selectedDepartments.includes(dept)
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-input"
                }`}>
                  {selectedDepartments.includes(dept) && <Check className="h-3 w-3" />}
                </div>
                {dept}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

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
