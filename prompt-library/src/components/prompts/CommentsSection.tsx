import { useState } from "react"
import { MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Comment } from "@/data/types"

interface CommentsSectionProps {
  promptId: string
  initialComments?: Comment[]
}

export function CommentsSection({ promptId: _promptId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments ?? [])
  const [newText, setNewText] = useState("")

  const handleSubmit = () => {
    if (!newText.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: "You",
      text: newText.trim(),
      createdAt: new Date().toISOString().split("T")[0],
    }

    setComments((prev) => [comment, ...prev])
    setNewText("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Comments & Feedback</h2>
        <span className="text-sm text-muted-foreground">({comments.length})</span>
      </div>

      {/* Comment list — newest first */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{comment.author}</span>
                <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
              </div>
              <p className="text-sm text-muted-foreground">{comment.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add a comment */}
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
          disabled={!newText.trim()}
          onClick={handleSubmit}
          className="cursor-pointer"
        >
          <Send className="h-3.5 w-3.5 mr-1" />
          Post Comment
        </Button>
      </div>
    </div>
  )
}
