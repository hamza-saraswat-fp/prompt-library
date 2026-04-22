import { useState, useEffect } from "react"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, X } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { getTagColor } from "@/lib/tag-colors"
import type { Prompt } from "@/data/types"

interface AdminSubmissionReviewProps {
  prompt: (Prompt & { status: string; visibility: string }) | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onActionComplete: () => void
}

export function AdminSubmissionReview({ prompt, open, onOpenChange, onActionComplete }: AdminSubmissionReviewProps) {
  const { getCategoryById } = useSupabaseData()
  const [rejectMode, setRejectMode] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    setRejectMode(false)
    setFeedback("")
  }, [prompt?.id])

  if (!prompt) return null

  const category = getCategoryById(prompt.categoryId)

  const handleApprove = async () => {
    setProcessing(true)
    const { error } = await supabase.from("pl_prompts").update({
      status: "published",
      visibility: "public",
      rejection_feedback: null,
    }).eq("id", prompt.id)
    setProcessing(false)
    if (error) { toast.error("Failed to approve: " + error.message); return }
    toast.success("Prompt approved and published")
    onActionComplete()
    onOpenChange(false)
  }

  const handleReject = async () => {
    if (!feedback.trim()) { toast.error("Please provide feedback"); return }
    setProcessing(true)
    const { error } = await supabase.from("pl_prompts").update({
      status: "rejected",
      rejection_feedback: feedback.trim(),
    }).eq("id", prompt.id)
    setProcessing(false)
    if (error) { toast.error("Failed to reject: " + error.message); return }
    toast.success("Prompt rejected with feedback")
    onActionComplete()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:!max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-0 shrink-0">
          <SheetTitle>Review Submission</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 pb-6 space-y-5 mt-4">
            {/* Title + Author */}
            <div>
              <h2 className="text-xl font-bold">{prompt.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">by {prompt.author}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.map((tag) => (
                <Badge key={tag} variant="outline" className={`text-xs px-2 py-0.5 ${getTagColor(tag)}`}>
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Overview */}
            <div>
              <h3 className="text-sm font-medium mb-1">Overview</h3>
              <p className="text-sm text-muted-foreground">{prompt.overview}</p>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {category && <span>Category: <span className="text-foreground">{category.name}</span></span>}
              <span>Models: <span className="text-foreground">{prompt.models.join(", ")}</span></span>
              <span>Departments: <span className="text-foreground">{prompt.departments.join(", ")}</span></span>
            </div>

            <Separator />

            {/* Prompt Text */}
            <div>
              <h3 className="text-sm font-medium mb-2">Prompt Text</h3>
              <div className="rounded-md bg-muted p-4 font-mono text-sm whitespace-pre-wrap">
                {prompt.promptText}
              </div>
            </div>

            {/* Variables */}
            {prompt.variables.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Variables</h3>
                <div className="flex flex-wrap gap-1.5">
                  {prompt.variables.map((v) => (
                    <Badge key={v.name} variant="secondary" className="text-xs">
                      {`{{${v.name}}}`}{v.description && ` — ${v.description}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer actions */}
        <div className="shrink-0 px-6 py-4 border-t space-y-3">
          {rejectMode ? (
            <>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Explain why this prompt is being rejected..."
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setRejectMode(false)} disabled={processing}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" className="cursor-pointer" onClick={handleReject} disabled={processing || !feedback.trim()}>
                  {processing ? "Rejecting..." : "Confirm Rejection"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="destructive" size="sm" className="cursor-pointer" onClick={() => setRejectMode(true)} disabled={processing}>
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
              <div className="flex-1" />
              <Button size="sm" className="cursor-pointer" onClick={handleApprove} disabled={processing}>
                <Check className="h-4 w-4 mr-1" /> {processing ? "Approving..." : "Approve & Publish"}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
