import { Button } from "@/components/ui/button"
import type { Category } from "@/data/types"

interface CategoryPillsProps {
  categories: Category[]
  selected: string | null
  onSelect: (categoryId: string | null) => void
}

export function CategoryPills({ categories, selected, onSelect }: CategoryPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === null ? "default" : "outline"}
        size="sm"
        className="cursor-pointer rounded-full"
        onClick={() => onSelect(null)}
      >
        All
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={selected === cat.id ? "default" : "outline"}
          size="sm"
          className="cursor-pointer rounded-full"
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  )
}
