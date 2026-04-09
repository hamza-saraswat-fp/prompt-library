import { useState, useEffect } from "react"
import { MessageSquare, Send, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

interface DbComment {
  id: string
  prompt_id: string
  user_id: string
  text: string
  created_at: string
  profiles: { display_name: string | null } | null
}

interface CommentsSectionProps {
  promptId: string
}

export function CommentsSection({ promptId }: CommentsSectionProps) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState<DbComment[]>([])
  const [newText, setNewText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase
      .from("comments")
      .select("id, prompt_id, user_id, text, created_at, profiles(display_name)")
      .eq("prompt_id", promptId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load comments:", error)
          return
        }
        if (data) setComments(data as DbComment[])
      })
  }, [promptId])

  const handleSubmit = async () => {
    if (!newText.trim() || !user) return
    setSubmitting(true)

    const { data, error } = await supabase
      .from("comments")
      .insert({ prompt_id: promptId, user_id: user.id, text: newText.trim() })
      .select("id, prompt_id, user_id, text, created_at, profiles(display_name)")
      .single()

    setSubmitting(false)
    if (error) {
      console.error("Failed to post comment:", error)
      return
    }
    if (data) {
      setComments((prev) => [data as DbComment, ...prev])
      setNewText("")
    }
  }

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId)
    if (error) {
      console.error("Failed to delete comment:", error)
      return
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const canDelete = (comment: DbComment) =>
    comment.user_id === user?.id || profile?.role === "admin"

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Comments & Feedback</h2>
        <span className="text-sm text-muted-foreground">({comments.length})</span>
      </div>

      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {comment.profiles?.display_name ?? "Anonymous"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                {canDelete(comment) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{comment.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <textarea
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Share your experience or feedback on this prompt..."
          rows={3}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <Button
          size="sm"
          disabled={!newText.trim() || submitting}
          onClick={handleSubmit}
          className="cursor-pointer"
        >
          <Send className="h-3.5 w-3.5 mr-1" />
          {submitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </div>
  )
}
