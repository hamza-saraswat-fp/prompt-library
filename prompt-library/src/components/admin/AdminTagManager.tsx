import { useState, useEffect, useCallback } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { getTagColor } from "@/lib/tag-colors"
import { AdminDeleteDialog } from "./AdminDeleteDialog"

interface TagRow {
  id: string
  type: "department" | "workflow"
}

export function AdminTagManager() {
  const [tags, setTags] = useState<TagRow[]>([])
  const [promptTags, setPromptTags] = useState<string[][]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<"department" | "workflow">("workflow")
  const [adding, setAdding] = useState(false)
  const [deleteTag, setDeleteTag] = useState<TagRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    const [tagsRes, promptsRes] = await Promise.all([
      supabase.from("tags").select("*").order("id"),
      supabase.from("prompts").select("tags"),
    ])
    if (tagsRes.data) setTags(tagsRes.data as TagRow[])
    if (promptsRes.data) setPromptTags(promptsRes.data.map((p: { tags: string[] }) => p.tags ?? []))
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const usageCount = (tagId: string) => promptTags.filter((tags) => tags.includes(tagId)).length

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name) return
    setAdding(true)
    const { error } = await supabase.from("tags").insert({ id: name, type: newType })
    setAdding(false)
    if (error) { toast.error("Failed to add tag: " + error.message); return }
    toast.success(`Tag "${name}" added`)
    setNewName("")
    fetchData()
  }

  const handleToggleType = async (tag: TagRow) => {
    const newTagType = tag.type === "department" ? "workflow" : "department"
    const { error } = await supabase.from("tags").update({ type: newTagType }).eq("id", tag.id)
    if (error) { toast.error("Failed to update: " + error.message); return }
    setTags((prev) => prev.map((t) => t.id === tag.id ? { ...t, type: newTagType } : t))
  }

  const handleDelete = async () => {
    if (!deleteTag) return
    setDeleting(true)
    const { error } = await supabase.from("tags").delete().eq("id", deleteTag.id)
    setDeleting(false)
    if (error) { toast.error("Failed to delete: " + error.message); return }
    toast.success(`Tag "${deleteTag.id}" deleted`)
    setDeleteTag(null)
    fetchData()
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="New tag name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="max-w-xs"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={newType}
          onChange={(e) => setNewType(e.target.value as "department" | "workflow")}
        >
          <option value="department">Department</option>
          <option value="workflow">Workflow</option>
        </select>
        <Button className="cursor-pointer" size="sm" onClick={handleAdd} disabled={adding || !newName.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add Tag
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
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Usage</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No tags</TableCell></TableRow>
              ) : tags.map((tag) => {
                const count = usageCount(tag.id)
                return (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.id}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs cursor-pointer ${getTagColor(tag.id)}`}
                        onClick={() => handleToggleType(tag)}
                      >
                        {tag.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{count}</TableCell>
                    <TableCell>
                      <button className="cursor-pointer text-muted-foreground hover:text-red-500 transition-colors" onClick={() => setDeleteTag(tag)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AdminDeleteDialog
        open={!!deleteTag}
        onOpenChange={(open) => !open && setDeleteTag(null)}
        title="Delete Tag"
        description={
          deleteTag && usageCount(deleteTag.id) > 0 ? (
            <p>Tag <span className="font-medium text-foreground">"{deleteTag.id}"</span> is used by {usageCount(deleteTag.id)} prompt{usageCount(deleteTag.id) !== 1 ? "s" : ""}. Deleting it won't remove it from existing prompts. Continue?</p>
          ) : (
            <p>Delete tag <span className="font-medium text-foreground">"{deleteTag?.id}"</span>?</p>
          )
        }
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  )
}
