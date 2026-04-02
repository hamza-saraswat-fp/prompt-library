import { useState } from "react"
import { ChevronDown, ChevronUp, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { UseCase } from "@/data/types"

interface UseCaseShowcaseProps {
  useCases: UseCase[]
}

export function UseCaseShowcase({ useCases }: UseCaseShowcaseProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button
        className="flex items-center gap-2 cursor-pointer text-left w-full group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Play className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        <span className="text-lg font-semibold group-hover:text-foreground transition-colors">
          See it in Action
        </span>
        <Badge variant="secondary" className="text-xs">
          {useCases.length} {useCases.length === 1 ? "example" : "examples"}
        </Badge>
        <span className="ml-auto">
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-6">
          {useCases.map((useCase, index) => (
            <div key={index}>
              {index > 0 && <Separator className="mb-6" />}
              {useCase.title && (
                <h3 className="font-semibold text-sm mb-3">{useCase.title}</h3>
              )}
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Input
                  </span>
                  <div className="mt-1 rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
                    {useCase.input}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Output
                  </span>
                  <div className="mt-1 rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap border-l-4 border-green-500">
                    {useCase.output}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
