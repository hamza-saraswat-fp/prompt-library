import { useState, useEffect, useCallback } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { AdminDeleteDialog } from "./AdminDeleteDialog"

interface CategoryRow {
  id: string
  name: string
  group_id: string
}

interface GroupRow {
  id: string
  name: string
}

function generateId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)
}

export function AdminCategoryManager() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [groups, setGroups] = useState<GroupRow[]>([])
  const [promptCounts, setPromptCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newGroupId, setNewGroupId] = useState("")
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [deleteCat, setDeleteCat] = useState<CategoryRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    const [catsRes, groupsRes, promptsRes] = await Promise.all([
      supabase.from("pl_categories").select("*").order("name"),
      supabase.from("pl_use_case_groups").select("id, name").order("sort_order"),
      supabase.from("pl_prompts").select("category_id"),
    ])
    if (catsRes.data) setCategories(catsRes.data as CategoryRow[])
    if (groupsRes.data) {
      setGroups(groupsRes.data as GroupRow[])
      if (!newGroupId && groupsRes.data.length > 0) setNewGroupId(groupsRes.data[0].id)
    }
    if (promptsRes.data) {
      const counts: Record<string, number> = {}
      for (const p of promptsRes.data as { category_id: string }[]) {
        counts[p.category_id] = (counts[p.category_id] ?? 0) + 1
      }
      setPromptCounts(counts)
    }
    setLoading(false)
  }, [newGroupId])

  useEffect(() => { fetchData() }, [fetchData])

  const groupName = (groupId: string) => groups.find((g) => g.id === groupId)?.name ?? "—"

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name || !newGroupId) return
    setAdding(true)
    const id = generateId(name)
    const { error } = await supabase.from("pl_categories").insert({ id, name, group_id: newGroupId })
    setAdding(false)
    if (error) { toast.error("Failed to add: " + error.message); return }
    toast.success(`Category "${name}" added`)
    setNewName("")
    fetchData()
  }

  const handleRename = async (catId: string) => {
    const name = editName.trim()
    if (!name) { setEditingId(null); return }
    const { error } = await supabase.from("pl_categories").update({ name }).eq("id", catId)
    if (error) { toast.error("Failed to rename: " + error.message); return }
    setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, name } : c))
    setEditingId(null)
    toast.success("Category renamed")
  }

  const handleDelete = async () => {
    if (!deleteCat) return
    setDeleting(true)
    const { error } = await supabase.from("pl_categories").delete().eq("id", deleteCat.id)
    setDeleting(false)
    if (error) { toast.error("Failed to delete: " + error.message); return }
    toast.success(`Category "${deleteCat.name}" deleted`)
    setDeleteCat(null)
    fetchData()
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="New category name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="max-w-xs"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={newGroupId}
          onChange={(e) => setNewGroupId(e.target.value)}
        >
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <Button className="cursor-pointer" size="sm" onClick={handleAdd} disabled={adding || !newName.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add Category
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
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Prompts</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No categories</TableCell></TableRow>
              ) : categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    {editingId === cat.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(cat.id)
                          if (e.key === "Escape") setEditingId(null)
                        }}
                        onBlur={() => handleRename(cat.id)}
                        className="h-7 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:underline font-medium"
                        onClick={() => { setEditingId(cat.id); setEditName(cat.name) }}
                      >
                        {cat.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{groupName(cat.group_id)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{promptCounts[cat.id] ?? 0}</TableCell>
                  <TableCell>
                    <button className="cursor-pointer text-muted-foreground hover:text-red-500 transition-colors" onClick={() => setDeleteCat(cat)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AdminDeleteDialog
        open={!!deleteCat}
        onOpenChange={(open) => !open && setDeleteCat(null)}
        title="Delete Category"
        description={
          deleteCat && (promptCounts[deleteCat.id] ?? 0) > 0 ? (
            <p>Category <span className="font-medium text-foreground">"{deleteCat.name}"</span> is used by {promptCounts[deleteCat.id]} prompt{promptCounts[deleteCat.id] !== 1 ? "s" : ""}. Those prompts will lose their category. Continue?</p>
          ) : (
            <p>Delete category <span className="font-medium text-foreground">"{deleteCat?.name}"</span>?</p>
          )
        }
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  )
}
