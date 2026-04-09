import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import type { UseCaseGroup } from "@/data/types"
import {
  Library,
  Heart,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  PenLine,
  BarChart3,
  Headphones,
  Code,
  Target,
  Palette,
  Zap,
  Shield,
} from "lucide-react"

const iconMap: Record<string, React.ElementType> = {
  PenLine,
  BarChart3,
  Headphones,
  Code,
  Target,
  Palette,
}

interface SidebarProps {
  selectedGroup: string | null
  onSelectGroup: (groupId: string | null) => void
  showFavorites: boolean
  onShowFavorites: () => void
  collapsed: boolean
  onToggleCollapsed: () => void
  onSubmitPrompt: () => void
  onGoHome: () => void
  activeView: "home" | "browse"
  groups: UseCaseGroup[]
  isAdmin?: boolean
  onAdminClick?: () => void
  isAdminView?: boolean
  onMyPrompts?: () => void
  isMyPromptsView?: boolean
}

export function Sidebar({
  selectedGroup,
  onSelectGroup,
  showFavorites,
  onShowFavorites,
  collapsed,
  onToggleCollapsed,
  onSubmitPrompt,
  onGoHome,
  activeView,
  groups,
  isAdmin,
  onAdminClick,
  isAdminView,
  onMyPrompts,
  isMyPromptsView,
}: SidebarProps) {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!isAdmin) return
    supabase.from("prompts").select("id", { count: "exact", head: true })
      .eq("status", "pending_review")
      .then(({ count }) => setPendingCount(count ?? 0))
  }, [isAdmin])

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Branding — click to go home */}
      <div className="flex items-center justify-between p-4">
        {!collapsed ? (
          <div className="min-w-0 cursor-pointer" onClick={onGoHome}>
            <img
              src="/fieldpulse-logo.svg"
              alt="FieldPulse"
              className="h-6 w-auto dark:invert"
            />
            <p className="text-[10px] text-muted-foreground mt-1">AI for the Field</p>
          </div>
        ) : (
          <Zap className="h-5 w-5 text-primary shrink-0 mx-auto cursor-pointer" onClick={onGoHome} />
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
            variant={activeView === "browse" && selectedGroup === null && !showFavorites ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start cursor-pointer",
              collapsed && "justify-center px-2"
            )}
            onClick={() => onSelectGroup(null)}
          >
            <Library className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2">All Prompts</span>}
          </Button>

          <Separator className="my-2" />

          {/* Use-Case Groups */}
          {groups.map((group) => {
            const Icon = iconMap[group.icon] ?? Library
            return (
              <Button
                key={group.id}
                variant={selectedGroup === group.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start cursor-pointer",
                  collapsed && "justify-center px-2"
                )}
                onClick={() => onSelectGroup(group.id)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="ml-2 truncate">{group.name}</span>}
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

          {/* My Prompts */}
          <Button
            variant={isMyPromptsView ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start cursor-pointer",
              collapsed && "justify-center px-2"
            )}
            onClick={onMyPrompts}
          >
            <FileText className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2">My Prompts</span>}
          </Button>

          {/* Admin */}
          {isAdmin && (
            <>
              <Separator className="my-2" />
              <Button
                variant={isAdminView ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start cursor-pointer",
                  collapsed && "justify-center px-2"
                )}
                onClick={onAdminClick}
              >
                <Shield className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="ml-2">Admin</span>}
                {!collapsed && pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-auto text-[10px] h-5 min-w-5 px-1">
                    {pendingCount}
                  </Badge>
                )}
              </Button>
            </>
          )}
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
