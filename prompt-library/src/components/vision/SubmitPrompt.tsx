import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { extractVariables } from "@/lib/variables"
import type { ModelType, Department } from "@/data/types"

const allModels: ModelType[] = ["ChatGPT", "Claude", "Gemini", "Model-Agnostic"]

interface SubmitPromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function generateId(title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${slug}-${suffix}`
}

export function SubmitPrompt({ open, onOpenChange }: SubmitPromptProps) {
  const { groups: useCaseGroups, categories, departments: DEPARTMENTS } = useSupabaseData()
  const { user, profile } = useAuth()
  const [title, setTitle] = useState("")
  const [overview, setOverview] = useState("")
  const [promptText, setPromptText] = useState("")
  const [departments, setDepartments] = useState<Department[]>([])
  const [categoryId, setCategoryId] = useState("")
  const [selectedModels, setSelectedModels] = useState<ModelType[]>([])

  const detectedVars = extractVariables(promptText)

  const toggleModel = (model: ModelType) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    )
  }

  const toggleDepartment = (dept: Department) => {
    setDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    )
  }

  const canSubmit =
    title.trim() !== "" &&
    promptText.trim() !== "" &&
    overview.trim() !== "" &&
    departments.length > 0 &&
    categoryId !== ""

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!canSubmit || !user) return
    setSubmitting(true)

    const variables = extractVariables(promptText).map((name) => ({ name, description: "" }))
    const authorName = profile?.display_name ?? "Anonymous"

    const { error } = await supabase.from("pl_prompts").insert({
      id: generateId(title),
      title: title.trim(),
      overview: overview.trim(),
      prompt_text: promptText.trim(),
      departments,
      category_id: categoryId,
      models: selectedModels.length > 0 ? selectedModels : ["Model-Agnostic"],
      variables,
      tags: [...departments],
      version: 1,
      copy_count: 0,
      is_trending: false,
      bundle_id: null,
      author: authorName,
      created_by: user.id,
      status: "pending_review",
      visibility: "private",
      version_history: [{ version: 1, date: new Date().toISOString().split("T")[0], author: authorName, changeDescription: "Initial submission" }],
      use_cases: [],
      comments: [],
    })

    setSubmitting(false)
    if (error) {
      toast.error("Failed to submit prompt: " + error.message)
      return
    }

    toast.success("Prompt submitted for review!")
    setTitle("")
    setOverview("")
    setPromptText("")
    setDepartments([])
    setCategoryId("")
    setSelectedModels([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit New Prompt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              className="mt-1"
              placeholder="e.g., Customer Onboarding Email"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Overview</label>
            <textarea
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="2-4 sentences: what this prompt does, when to use it, and what kind of output to expect."
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Prompt Text</label>
            <textarea
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono min-h-[120px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={"Use {{variable_name}} for fillable fields..."}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
            {detectedVars.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground">Detected variables:</span>
                {detectedVars.map((v) => (
                  <Badge key={v} variant="secondary" className="text-[10px]">
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium">Departments</label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map((dept) => (
                <Button
                  key={dept}
                  variant={departments.includes(dept) ? "default" : "outline"}
                  size="sm"
                  className="cursor-pointer text-xs"
                  onClick={() => toggleDepartment(dept)}
                >
                  {dept}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select category...</option>
              {useCaseGroups.map((group) => (
                <optgroup key={group.id} label={group.name}>
                  {categories
                    .filter((c) => group.categoryIds.includes(c.id))
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Models</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {allModels.map((model) => (
                <Button
                  key={model}
                  variant={selectedModels.includes(model) ? "default" : "outline"}
                  size="sm"
                  className="cursor-pointer text-xs"
                  onClick={() => toggleModel(model)}
                >
                  {model}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="cursor-pointer" onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? "Submitting..." : "Submit for Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
