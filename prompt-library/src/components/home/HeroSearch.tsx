import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface HeroSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function HeroSearch({ searchQuery, onSearchChange }: HeroSearchProps) {
  return (
    <div className="flex flex-col items-center px-6 py-10 md:py-16 bg-gradient-to-b from-muted/50 to-transparent dark:from-muted/30 rounded-xl">
      <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
        AI for the Field
      </p>
      <h1 className="text-2xl md:text-4xl font-bold text-center mb-6">
        What can we help you with?
      </h1>
      <div className="relative w-full max-w-2xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-12 pl-11 pr-11 text-lg rounded-xl"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
