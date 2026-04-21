import { useState, useEffect, useCallback } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getTagColor } from "@/lib/tag-colors"
import { supabase } from "@/lib/supabase"
import { AdminSubmissionReview } from "./AdminSubmissionReview"
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

interface AdminSubmissionQueueProps {
  onCountChange?: (count: number) => void
}

export function AdminSubmissionQueue({ onCountChange }: AdminSubmissionQueueProps) {
  const [submissions, setSubmissions] = useState<(Prompt & { status: string; visibility: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewPrompt, setReviewPrompt] = useState<(Prompt & { status: string; visibility: string }) | null>(null)

  const fetchSubmissions = useCallback(async () => {
    const { data, error } = await supabase
      .from("pl_prompts")
      .select("*")
      .eq("status", "pending_review")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Failed to fetch submissions:", error)
      setLoading(false)
      return
    }
    const items = (data as DbRow[]).map(toPrompt)
    setSubmissions(items)
    onCountChange?.(items.length)
    setLoading(false)
  }, [onCountChange])

  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])

  const handleRowClick = (prompt: Prompt & { status: string; visibility: string }) => {
    setReviewPrompt(prompt)
    setReviewOpen(true)
  }

  return (
    <div>
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">No pending submissions</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Submissions from team members will appear here for review.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((prompt) => (
                <TableRow key={prompt.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(prompt)}>
                  <TableCell className="font-medium">{prompt.title}</TableCell>
                  <TableCell className="text-muted-foreground">{prompt.author}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(prompt.createdAt).toLocaleDateString()}
                  </TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AdminSubmissionReview
        prompt={reviewPrompt}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        onActionComplete={fetchSubmissions}
      />
    </div>
  )
}
