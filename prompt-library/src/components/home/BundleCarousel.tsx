import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Package, ChevronLeft, ChevronRight } from "lucide-react"
import type { Bundle } from "@/data/types"

interface BundleCarouselProps {
  bundles: Bundle[]
  onBundleClick: (bundleId: string) => void
}

export function BundleCarousel({ bundles, onBundleClick }: BundleCarouselProps) {
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

  if (bundles.length === 0) return null

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    })
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Prompt Bundles</h2>
      <div className="relative group">
        {/* Left arrow */}
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

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="w-72 shrink-0 rounded-lg border bg-card p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onBundleClick(bundle.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-primary shrink-0" />
                <span className="font-semibold text-sm truncate">{bundle.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {bundle.description}
              </p>
              <p className="text-xs font-medium text-primary">
                {bundle.promptIds.length} prompt{bundle.promptIds.length !== 1 ? "s" : ""}
              </p>
            </div>
          ))}
        </div>

        {/* Right arrow */}
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
