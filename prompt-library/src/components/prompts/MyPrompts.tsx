import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { getTagColor } from "@/lib/tag-colors"
import { AlertTriangle } from "lucide-react"
import type { Prompt } from "@/data/types"

interface MyPrompt extends Prompt {
  status: string
  visibility: string
  rejection_feedback: string | null
}

interface DbRow {
  id: string; title: string; overview: string; prompt_text: string
  departments: string[]; category_id: string; models: string[]
  variables: { name: string; description: string }[]
  tags: string[]; version: number; copy_count: number; is_trending: boolean
  bundle_id: string | null; author: string; status: string; visibility: string
  rejection_feedback: string | null
  version_history: Prompt["versionHistory"]; use_cases: Prompt["useCases"]
  comments: Prompt["comments"]; created_at: string; updated_at: string
}

function toMyPrompt(row: DbRow): MyPrompt {
  return {
    id: row.id, title: row.title, overview: row.overview, promptText: row.prompt_text,
    departments: row.departments as Prompt["departments"], categoryId: row.category_id,
    models: row.models as Prompt["models"], variables: row.variables, tags: row.tags,
    version: row.version, copyCount: row.copy_count, isTrending: row.is_trending,
    bundleId: row.bundle_id ?? undefined, author: row.author,
    versionHistory: row.version_history, useCases: row.use_cases, comments: row.comments,
    createdAt: row.created_at, updatedAt: row.updated_at,
    status: row.status, visibility: row.visibility,
    rejection_feedback: row.rejection_feedback,
  }
}

const statusLabel: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  published: "Published",
  rejected: "Rejected",
}

const statusColor: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  pending_review: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  draft: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
}

export function MyPrompts() {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<MyPrompt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from("pl_prompts")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error("Failed to fetch my prompts:", error); setLoading(false); return }
        if (data) setPrompts((data as DbRow[]).map(toMyPrompt))
        setLoading(false)
      })
  }, [user])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">My Prompts</h1>
        <p className="text-sm text-muted-foreground mt-1">Prompts you've submitted and their review status</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
      ) : prompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">No prompts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the "Submit Prompt" button to create your first prompt.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="rounded-lg border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{prompt.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{prompt.overview}</p>
                </div>
                <Badge variant="outline" className={`text-xs shrink-0 ${statusColor[prompt.status] ?? statusColor.draft}`}>
                  {statusLabel[prompt.status] ?? prompt.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {prompt.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className={`text-[10px] px-1.5 py-0 ${getTagColor(tag)}`}>{tag}</Badge>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Submitted {new Date(prompt.createdAt).toLocaleDateString()}
              </p>

              {/* Rejection feedback */}
              {prompt.status === "rejected" && prompt.rejection_feedback && (
                <div className="rounded-md border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 p-3 mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Rejection Feedback</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400">{prompt.rejection_feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
