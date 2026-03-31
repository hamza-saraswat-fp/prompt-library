import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, TrendingUp, Clock } from "lucide-react"
import { modelColors } from "@/lib/constants"
import type { Prompt, Team } from "@/data/types"

interface PromptTableProps {
  prompts: Prompt[]
  teams: Team[]
  onCopy: (prompt: Prompt) => void
  onClick: (prompt: Prompt) => void
}

export function PromptTable({ prompts, teams, onCopy, onClick }: PromptTableProps) {
  const getTeamName = (teamId: string) =>
    teams.find((t) => t.id === teamId)?.name ?? teamId

  const getCategoryName = (prompt: Prompt) => {
    const team = teams.find((t) => t.id === prompt.teamId)
    return team?.categories.find((c) => c.id === prompt.categoryId)?.name ?? ""
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px]">Title</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Model</TableHead>
            <TableHead className="text-right">Copies</TableHead>
            <TableHead className="text-right">Ver.</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prompts.map((prompt) => (
            <TableRow
              key={prompt.id}
              className="cursor-pointer"
              onClick={() => onClick(prompt)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {prompt.title}
                  {prompt.isTrending && (
                    <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
                  )}
                  {prompt.status === "pending" && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-yellow-500 text-yellow-600 dark:text-yellow-400">
                      <Clock className="h-2.5 w-2.5 mr-0.5" />
                      Pending
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">
                  {getTeamName(prompt.teamId)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {getCategoryName(prompt)}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {prompt.models.map((model) => (
                    <Badge
                      key={model}
                      className={`text-[10px] px-1.5 py-0 ${modelColors[model] ?? ""}`}
                    >
                      {model}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {prompt.copyCount}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                v{prompt.version}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCopy(prompt)
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
