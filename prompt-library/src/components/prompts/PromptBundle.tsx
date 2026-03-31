import { Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Bundle } from "@/data/types"
import type { ReactNode } from "react"

interface PromptBundleProps {
  bundle: Bundle
  children: ReactNode
}

export function PromptBundle({ bundle, children }: PromptBundleProps) {
  return (
    <div className="rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">{bundle.name}</span>
        <Badge variant="secondary" className="text-[10px]">
          Bundle
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{bundle.description}</p>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  )
}
