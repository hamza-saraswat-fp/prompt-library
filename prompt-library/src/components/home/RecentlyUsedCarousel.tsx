import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Prompt, Category } from "@/data/types"

interface RecentlyUsedCarouselProps {
  prompts: Prompt[]
  onOpenPrompt: (prompt: Prompt) => void
  getCategoryById: (id: string) => Category | undefined
}

export function RecentlyUsedCarousel({ prompts, onOpenPrompt, getCategoryById }: RecentlyUsedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkScroll)
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", checkScroll)
      ro.disconnect()
    }
  }, [checkScroll])

  if (prompts.length === 0) return null

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    })
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Recently Used</h2>
      <div className="relative group">
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 rounded-full shadow-md cursor-pointer bg-background"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {prompts.map((prompt) => {
            const category = getCategoryById(prompt.categoryId)
            return (
              <div
                key={prompt.id}
                className="shrink-0 px-4 py-2.5 rounded-lg border bg-card cursor-pointer hover:shadow-md transition-shadow max-w-[200px]"
                onClick={() => onOpenPrompt(prompt)}
              >
                <p className="font-medium text-sm truncate">{prompt.title}</p>
                {category && (
                  <p className="text-xs text-muted-foreground truncate">{category.name}</p>
                )}
              </div>
            )
          })}
        </div>

        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 rounded-full shadow-md cursor-pointer bg-background"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
