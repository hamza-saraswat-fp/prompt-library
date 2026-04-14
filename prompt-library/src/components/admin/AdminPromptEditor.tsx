import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Save, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { extractVariablesWithPlaceholders } from "@/lib/variables"
import { AdminDeleteDialog } from "./AdminDeleteDialog"
import type { Prompt, ModelType } from "@/data/types"

const ALL_MODELS: ModelType[] = ["ChatGPT", "Claude", "Gemini", "Model-Agnostic"]

function generateId(title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${slug}-${suffix}`
}

interface AdminPromptEditorProps {
  prompt: Prompt | null // null = create mode
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  onDeleted: () => void
  onPreview: (prompt: Prompt) => void
}

export function AdminPromptEditor({
  prompt,
  open,
  onOpenChange,
  onSaved,
  onDeleted,
  onPreview,
}: AdminPromptEditorProps) {
  const { user, profile } = useAuth()
  const { groups, categories, departments, allTags, bundles } = useSupabaseData()

  const isCreate = !prompt

  const [title, setTitle] = useState("")
  const [overview, setOverview] = useState("")
  const [promptText, setPromptText] = useState("")
  const [selectedDepts, setSelectedDepts] = useState<string[]>([])
  const [categoryId, setCategoryId] = useState("")
  const [selectedModels, setSelectedModels] = useState<ModelType[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [bundleId, setBundleId] = useState("")
  const [status, setStatus] = useState<string>("published")
  const [visibility, setVisibility] = useState<"private" | "public">("public")
  const [author, setAuthor] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title)
      setOverview(prompt.overview)
      setPromptText(prompt.promptText)
      setSelectedDepts(prompt.departments)
      setCategoryId(prompt.categoryId)
      setSelectedModels(prompt.models as ModelType[])
      setSelectedTags(prompt.tags)
      setBundleId(prompt.bundleId ?? "")
      setStatus(((prompt as unknown as Record<string, unknown>).status as "draft" | "published") ?? "published")
      setVisibility(((prompt as unknown as Record<string, unknown>).visibility as "private" | "public") ?? "public")
      setAuthor(prompt.author)
    } else {
      setTitle("")
      setOverview("")
      setPromptText("")
      setSelectedDepts([])
      setCategoryId("")
      setSelectedModels([])
      setSelectedTags([])
      setBundleId("")
      setStatus("published")
      setVisibility("public")
      setAuthor(profile?.display_name ?? "")
    }
  }, [prompt, profile])

  const detectedVarsWithPlaceholders = extractVariablesWithPlaceholders(promptText)
  const detectedVars = detectedVarsWithPlaceholders.map((v) => v.name)

  const canSave = title.trim() && overview.trim() && promptText.trim() && categoryId

  const handleSave = async () => {
    if (!canSave || !user) return
    setSaving(true)

    const variables = detectedVarsWithPlaceholders.map(({ name, placeholder }) => ({
      name,
      description: placeholder || prompt?.variables.find((v) => v.name === name)?.description || "",
    }))

    const row = {
      title: title.trim(),
      overview: overview.trim(),
      prompt_text: promptText.trim(),
      departments: selectedDepts,
      category_id: categoryId,
      models: selectedModels.length > 0 ? selectedModels : ["Model-Agnostic"],
      variables,
      tags: selectedTags,
      bundle_id: bundleId || null,
      status,
      visibility,
      author: author.trim() || profile?.display_name || "Anonymous",
      version_history: prompt?.versionHistory ?? [{ version: 1, date: new Date().toISOString().split("T")[0], author: author || profile?.display_name, changeDescription: "Initial version" }],
      use_cases: prompt?.useCases ?? [],
      comments: [],
    }

    let error
    if (isCreate) {
      const res = await supabase.from("prompts").insert({
        ...row,
        id: generateId(title),
        created_by: user.id,
        version: 1,
        copy_count: 0,
        is_trending: false,
      })
      error = res.error
    } else {
      const res = await supabase.from("prompts").update(row).eq("id", prompt.id)
      error = res.error
    }

    setSaving(false)
    if (error) {
      toast.error("Failed to save: " + error.message)
      return
    }
    toast.success(isCreate ? "Prompt created" : "Prompt saved")
    onSaved()
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (!prompt) return
    setDeleting(true)
    const { error } = await supabase.from("prompts").delete().eq("id", prompt.id)
    setDeleting(false)
    if (error) {
      toast.error("Failed to delete: " + error.message)
      return
    }
    toast.success("Prompt deleted")
    setDeleteOpen(false)
    onDeleted()
    onOpenChange(false)
  }

  const handlePreview = () => {
    const previewPrompt: Prompt = {
      id: prompt?.id ?? "preview",
      title, overview, promptText, departments: selectedDepts as Prompt["departments"],
      categoryId, models: selectedModels, variables: detectedVars.map((n) => ({ name: n, description: "" })),
      tags: selectedTags, version: prompt?.version ?? 1, copyCount: prompt?.copyCount ?? 0,
      isTrending: prompt?.isTrending ?? false, bundleId: bundleId || undefined,
      author, versionHistory: prompt?.versionHistory ?? [], createdAt: prompt?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onPreview(previewPrompt)
  }

  const toggleIn = <T,>(arr: T[], item: T) =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:!max-w-2xl p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-0 shrink-0">
            <SheetTitle>{isCreate ? "Create Prompt" : "Edit Prompt"}</SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 pb-6 space-y-5">
              {/* Title */}
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Prompt title" />
              </div>

              {/* Author */}
              <div>
                <label className="text-sm font-medium">Author</label>
                <Input className="mt-1" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" />
              </div>

              {/* Overview */}
              <div>
                <label className="text-sm font-medium">Overview</label>
                <textarea
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={overview} onChange={(e) => setOverview(e.target.value)} placeholder="2-4 sentences describing this prompt"
                />
              </div>

              {/* Prompt Text */}
              <div>
                <label className="text-sm font-medium">Prompt Text</label>
                <textarea
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono min-h-[160px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={promptText} onChange={(e) => setPromptText(e.target.value)} placeholder={"Use {{variable_name}} or {{variable_name | example value}} for fillable fields..."}
                />
                {detectedVars.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="text-xs text-muted-foreground">Variables:</span>
                    {detectedVars.map((v) => (
                      <Badge key={v} variant="secondary" className="text-[10px]">{`{{${v}}}`}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Status + Visibility */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value as string)}>
                    <option value="draft">Draft</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="published">Published</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Visibility</label>
                  <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={visibility} onChange={(e) => setVisibility(e.target.value as "private" | "public")}>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium">Category</label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">Select category...</option>
                  {groups.map((group) => (
                    <optgroup key={group.id} label={group.name}>
                      {categories.filter((c) => group.categoryIds.includes(c.id)).map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Departments */}
              <div>
                <label className="text-sm font-medium">Departments</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {departments.map((dept) => (
                    <Button key={dept} variant={selectedDepts.includes(dept) ? "default" : "outline"} size="sm" className="cursor-pointer text-xs" onClick={() => setSelectedDepts((p) => toggleIn(p, dept))}>
                      {dept}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Button key={tag} variant={selectedTags.includes(tag) ? "default" : "outline"} size="sm" className="cursor-pointer text-xs" onClick={() => setSelectedTags((p) => toggleIn(p, tag))}>
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Models */}
              <div>
                <label className="text-sm font-medium">Models</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {ALL_MODELS.map((model) => (
                    <Button key={model} variant={selectedModels.includes(model) ? "default" : "outline"} size="sm" className="cursor-pointer text-xs" onClick={() => setSelectedModels((p) => toggleIn(p, model) as ModelType[])}>
                      {model}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Bundle */}
              <div>
                <label className="text-sm font-medium">Bundle (optional)</label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={bundleId} onChange={(e) => setBundleId(e.target.value)}>
                  <option value="">None</option>
                  {bundles.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </ScrollArea>

          {/* Footer actions */}
          <div className="shrink-0 flex items-center gap-2 px-6 py-4 border-t">
            {!isCreate && (
              <Button variant="destructive" size="sm" className="cursor-pointer" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-1" /> Preview
            </Button>
            <Button size="sm" className="cursor-pointer" onClick={handleSave} disabled={!canSave || saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {prompt && (
        <AdminDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          promptTitle={prompt.title}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </>
  )
}
