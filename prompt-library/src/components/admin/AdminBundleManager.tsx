import { useState, useEffect, useCallback } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Save, Search, Check } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { AdminDeleteDialog } from "./AdminDeleteDialog"

interface BundleRow {
  id: string
  name: string
  description: string | null
  sort_order: number
}

interface PromptRow {
  id: string
  title: string
  bundle_id: string | null
}

function generateId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)
  return `bundle-${slug}-${Math.random().toString(36).slice(2, 6)}`
}

export function AdminBundleManager() {
  const [bundles, setBundles] = useState<BundleRow[]>([])
  const [prompts, setPrompts] = useState<PromptRow[]>([])
  const [loading, setLoading] = useState(true)

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingBundle, setEditingBundle] = useState<BundleRow | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [selectedPromptIds, setSelectedPromptIds] = useState<Set<string>>(new Set())
  const [promptSearch, setPromptSearch] = useState("")
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deleteBundle, setDeleteBundle] = useState<BundleRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    const [bundlesRes, promptsRes] = await Promise.all([
      supabase.from("pl_bundles").select("*").order("sort_order"),
      supabase.from("pl_prompts").select("id, title, bundle_id").order("title"),
    ])
    if (bundlesRes.data) setBundles(bundlesRes.data as BundleRow[])
    if (promptsRes.data) setPrompts(promptsRes.data as PromptRow[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const promptCount = (bundleId: string) => prompts.filter((p) => p.bundle_id === bundleId).length

  const openEditor = (bundle: BundleRow | null) => {
    setEditingBundle(bundle)
    if (bundle) {
      setName(bundle.name)
      setDescription(bundle.description ?? "")
      setSortOrder(bundle.sort_order)
      setSelectedPromptIds(new Set(prompts.filter((p) => p.bundle_id === bundle.id).map((p) => p.id)))
    } else {
      setName("")
      setDescription("")
      setSortOrder(bundles.length)
      setSelectedPromptIds(new Set())
    }
    setPromptSearch("")
    setEditorOpen(true)
  }

  const togglePrompt = (promptId: string) => {
    setSelectedPromptIds((prev) => {
      const next = new Set(prev)
      if (next.has(promptId)) next.delete(promptId)
      else next.add(promptId)
      return next
    })
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)

    const isCreate = !editingBundle
    const bundleId = editingBundle?.id ?? generateId(name)

    // Save bundle row
    let error
    if (isCreate) {
      const res = await supabase.from("pl_bundles").insert({ id: bundleId, name: name.trim(), description: description.trim() || null, sort_order: sortOrder })
      error = res.error
    } else {
      const res = await supabase.from("pl_bundles").update({ name: name.trim(), description: description.trim() || null, sort_order: sortOrder }).eq("id", bundleId)
      error = res.error
    }

    if (error) { setSaving(false); toast.error("Failed to save: " + error.message); return }

    // Update prompt associations
    const previousIds = new Set(prompts.filter((p) => p.bundle_id === bundleId).map((p) => p.id))
    const toAdd = [...selectedPromptIds].filter((id) => !previousIds.has(id))
    const toRemove = [...previousIds].filter((id) => !selectedPromptIds.has(id))

    if (toAdd.length > 0) {
      await supabase.from("pl_prompts").update({ bundle_id: bundleId }).in("id", toAdd)
    }
    if (toRemove.length > 0) {
      await supabase.from("pl_prompts").update({ bundle_id: null }).in("id", toRemove)
    }

    setSaving(false)
    toast.success(isCreate ? "Bundle created" : "Bundle saved")
    setEditorOpen(false)
    fetchData()
  }

  const handleDelete = async () => {
    if (!deleteBundle) return
    setDeleting(true)
    // Clear bundle_id from associated prompts first
    await supabase.from("pl_prompts").update({ bundle_id: null }).eq("bundle_id", deleteBundle.id)
    const { error } = await supabase.from("pl_bundles").delete().eq("id", deleteBundle.id)
    setDeleting(false)
    if (error) { toast.error("Failed to delete: " + error.message); return }
    toast.success(`Bundle "${deleteBundle.name}" deleted`)
    setDeleteBundle(null)
    setEditorOpen(false)
    fetchData()
  }

  const filteredPrompts = promptSearch
    ? prompts.filter((p) => p.title.toLowerCase().includes(promptSearch.toLowerCase()))
    : prompts

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button className="cursor-pointer" onClick={() => openEditor(null)}>
          <Plus className="h-4 w-4 mr-1" /> Create Bundle
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Prompts</TableHead>
                <TableHead className="text-right">Order</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {bundles.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No bundles</TableCell></TableRow>
              ) : bundles.map((bundle) => (
                <TableRow key={bundle.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEditor(bundle)}>
                  <TableCell className="font-medium">{bundle.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[300px] truncate">{bundle.description ?? "—"}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{promptCount(bundle.id)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{bundle.sort_order}</TableCell>
                  <TableCell>
                    <button
                      className="cursor-pointer text-muted-foreground hover:text-red-500 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setDeleteBundle(bundle) }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Editor Sheet */}
      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent className="sm:!max-w-2xl p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-0 shrink-0">
            <SheetTitle>{editingBundle ? "Edit Bundle" : "Create Bundle"}</SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 pb-6 space-y-5 mt-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Bundle name" />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this bundle is about..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Sort Order</label>
                <Input className="mt-1 max-w-[100px]" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium">Select Prompts</label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                  {selectedPromptIds.size} prompt{selectedPromptIds.size !== 1 ? "s" : ""} selected
                </p>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Filter prompts..." value={promptSearch} onChange={(e) => setPromptSearch(e.target.value)} className="pl-9" />
                </div>
                <div className="max-h-[300px] overflow-y-auto border rounded-md p-1 space-y-0.5">
                  {filteredPrompts.map((prompt) => {
                    const isSelected = selectedPromptIds.has(prompt.id)
                    const inOtherBundle = prompt.bundle_id && prompt.bundle_id !== editingBundle?.id
                    const otherBundleName = inOtherBundle ? bundles.find((b) => b.id === prompt.bundle_id)?.name : null
                    return (
                      <div
                        key={prompt.id}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted/50 ${isSelected ? "bg-muted" : ""}`}
                        onClick={() => togglePrompt(prompt.id)}
                      >
                        <div className={`h-4 w-4 flex items-center justify-center rounded border ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input"}`}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <span className="text-sm flex-1 truncate">{prompt.title}</span>
                        {otherBundleName && (
                          <span className="text-[10px] text-muted-foreground shrink-0">In: {otherBundleName}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="shrink-0 flex items-center gap-2 px-6 py-4 border-t">
            {editingBundle && (
              <Button variant="destructive" size="sm" className="cursor-pointer" onClick={() => setDeleteBundle(editingBundle)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button size="sm" className="cursor-pointer" onClick={handleSave} disabled={!name.trim() || saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AdminDeleteDialog
        open={!!deleteBundle}
        onOpenChange={(open) => !open && setDeleteBundle(null)}
        title="Delete Bundle"
        description={
          deleteBundle ? (
            <p>This will remove {promptCount(deleteBundle.id)} prompt{promptCount(deleteBundle.id) !== 1 ? "s" : ""} from bundle <span className="font-medium text-foreground">"{deleteBundle.name}"</span> (they won't be deleted). Continue?</p>
          ) : null
        }
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  )
}
