import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { getCategoryById } from "@/data/teams"
import { getTagColor } from "@/lib/tag-colors"
import type { Prompt } from "@/data/types"

interface PromptTableProps {
  prompts: Prompt[]
  onClick: (prompt: Prompt) => void
  sortField: "title" | "rating" | null
  sortDirection: "asc" | "desc"
  onSort: (field: "title" | "rating") => void
}

export function PromptTable({ prompts, onClick, sortField, sortDirection, onSort }: PromptTableProps) {
  const SortIcon = sortField === "title"
    ? sortDirection === "asc" ? ArrowUp : ArrowDown
    : ArrowUpDown

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px] py-2 px-3 text-xs">
              <button
                className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors"
                onClick={() => onSort("title")}
              >
                Title
                <SortIcon className="h-3.5 w-3.5" />
              </button>
            </TableHead>
            <TableHead className="py-2 px-3 text-xs">Overview</TableHead>
            <TableHead className="py-2 px-3 text-xs">Tags</TableHead>
            <TableHead className="py-2 px-3 text-xs">Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prompts.map((prompt) => (
            <TableRow
              key={prompt.id}
              className="cursor-pointer"
              onClick={() => onClick(prompt)}
            >
              <TableCell className="font-medium py-2 px-3">
                <div className="flex items-center gap-2">
                  {prompt.title}
                  {prompt.isTrending && (
                    <TrendingUp className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2 px-3 max-w-[300px]">
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {prompt.overview}
                </p>
              </TableCell>
              <TableCell className="py-2 px-3">
                <div className="flex flex-wrap gap-1">
                  {prompt.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className={`text-[10px] px-1.5 py-0 ${getTagColor(tag)}`}>
                      {tag}
                    </Badge>
                  ))}
                  {prompt.tags.length > 2 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                      +{prompt.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2 px-3 text-sm text-muted-foreground">
                {getCategoryById(prompt.categoryId)?.name ?? ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
