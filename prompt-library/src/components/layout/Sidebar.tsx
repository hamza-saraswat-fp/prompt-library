import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { teams } from "@/data/teams"
import {
  Library,
  Heart,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  HeartHandshake,
  Settings,
  Code,
  Lightbulb,
  Megaphone,
  ShieldCheck,
} from "lucide-react"

const iconMap: Record<string, React.ElementType> = {
  TrendingUp,
  HeartHandshake,
  Settings,
  Code,
  Lightbulb,
  Megaphone,
  ShieldCheck,
}

interface SidebarProps {
  selectedTeam: string | null
  onSelectTeam: (teamId: string | null) => void
  showFavorites: boolean
  onShowFavorites: () => void
  collapsed: boolean
  onToggleCollapsed: () => void
  onSubmitPrompt: () => void
}

export function Sidebar({
  selectedTeam,
  onSelectTeam,
  showFavorites,
  onShowFavorites,
  collapsed,
  onToggleCollapsed,
  onSubmitPrompt,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <h2 className="text-sm font-semibold tracking-tight">Prompt Library</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 cursor-pointer"
          onClick={onToggleCollapsed}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* All Prompts */}
          <Button
            variant={selectedTeam === null && !showFavorites ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start cursor-pointer",
              collapsed && "justify-center px-2"
            )}
            onClick={() => onSelectTeam(null)}
          >
            <Library className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2">All Prompts</span>}
          </Button>

          <Separator className="my-2" />

          {/* Teams */}
          {teams.map((team) => {
            const Icon = iconMap[team.icon] ?? Library
            return (
              <Button
                key={team.id}
                variant={selectedTeam === team.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start cursor-pointer",
                  collapsed && "justify-center px-2"
                )}
                onClick={() => onSelectTeam(team.id)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="ml-2">{team.name}</span>}
              </Button>
            )
          })}

          <Separator className="my-2" />

          {/* Favorites */}
          <Button
            variant={showFavorites ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start cursor-pointer",
              collapsed && "justify-center px-2"
            )}
            onClick={onShowFavorites}
          >
            <Heart className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2">My Favorites</span>}
          </Button>
        </div>
      </ScrollArea>

      {/* Submit Button */}
      <div className="p-2">
        <Button
          className={cn(
            "w-full cursor-pointer",
            collapsed && "px-2"
          )}
          onClick={onSubmitPrompt}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Submit Prompt</span>}
        </Button>
      </div>
    </aside>
  )
}
