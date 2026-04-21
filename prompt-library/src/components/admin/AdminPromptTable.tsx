import { useState, useEffect, useCallback } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { getTagColor } from "@/lib/tag-colors"
import { AdminPromptEditor } from "./AdminPromptEditor"
import type { Prompt } from "@/data/types"

interface DbRow {
  id: string; title: string; overview: string; prompt_text: string
  departments: string[]; category_id: string; models: string[]
  variables: { name: string; description: string }[]
  tags: string[]; version: number; copy_count: number; is_trending: boolean
  bundle_id: string | null; author: string; status: string; visibility: string
  version_history: Prompt["versionHistory"]; use_cases: Prompt["useCases"]
  comments: Prompt["comments"]; created_at: string; updated_at: string
}

function toPrompt(row: DbRow): Prompt & { status: string; visibility: string } {
  return {
    id: row.id, title: row.title, overview: row.overview, promptText: row.prompt_text,
    departments: row.departments as Prompt["departments"], categoryId: row.category_id,
    models: row.models as Prompt["models"], variables: row.variables, tags: row.tags,
    version: row.version, copyCount: row.copy_count, isTrending: row.is_trending,
    bundleId: row.bundle_id ?? undefined, author: row.author,
    versionHistory: row.version_history, useCases: row.use_cases, comments: row.comments,
    createdAt: row.created_at, updatedAt: row.updated_at,
    status: row.status, visibility: row.visibility,
  }
}

interface AdminPromptTableProps {
  onPreview: (prompt: Prompt) => void
}

export function AdminPromptTable({ onPreview }: AdminPromptTableProps) {
  const { getCategoryById } = useSupabaseData()
  const [prompts, setPrompts] = useState<(Prompt & { status: string; visibility: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)

  const fetchPrompts = useCallback(async () => {
    const { data, error } = await supabase
      .from("pl_prompts")
      .select("*")
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch admin prompts:", error)
      return
    }
    if (data) setPrompts((data as DbRow[]).map(toPrompt))
    setLoading(false)
  }, [])

  useEffect(() => { fetchPrompts() }, [fetchPrompts])

  const filtered = search
    ? prompts.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.author.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : prompts

  const handleRowClick = (prompt: Prompt & { status: string; visibility: string }) => {
    setEditingPrompt(prompt)
    setEditorOpen(true)
  }

  const handleCreate = () => {
    setEditingPrompt(null)
    setEditorOpen(true)
  }

  const statusColor = (s: string) => {
    if (s === "published") return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
    if (s === "pending_review") return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
    if (s === "rejected") return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
    return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search prompts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex-1" />
        <Button className="cursor-pointer" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" /> Create Prompt
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {search ? "No prompts match your search" : "No prompts yet"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((prompt) => (
                  <TableRow key={prompt.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(prompt)}>
                    <TableCell className="font-medium max-w-[240px] truncate">{prompt.title}</TableCell>
                    <TableCell className="text-muted-foreground">{prompt.author}</TableCell>
                    <TableCell className="text-muted-foreground">{getCategoryById(prompt.categoryId)?.name ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {prompt.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className={`text-[10px] px-1.5 py-0 ${getTagColor(tag)}`}>{tag}</Badge>
                        ))}
                        {prompt.tags.length > 2 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">+{prompt.tags.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColor(prompt.status)}`}>
                        {prompt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {new Date(prompt.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AdminPromptEditor
        prompt={editingPrompt}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSaved={fetchPrompts}
        onDeleted={fetchPrompts}
        onPreview={onPreview}
      />
    </div>
  )
}
