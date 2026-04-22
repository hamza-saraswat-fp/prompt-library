import { useState, useEffect, useCallback } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Shield, User, FileText, MessageSquare, ThumbsUp } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

interface ProfileRow {
  id: string
  email: string
  display_name: string | null
  department: string | null
  role: string
  created_at: string
  updated_at: string
}

interface UserActivity {
  promptsAuthored: { id: string; title: string; status: string }[]
  comments: { id: string; prompt_id: string; text: string; created_at: string }[]
  ratingsCount: number
}

export function AdminUserManager() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [detailUser, setDetailUser] = useState<ProfileRow | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [activity, setActivity] = useState<UserActivity | null>(null)
  const [activityLoading, setActivityLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) { console.error("Failed to fetch users:", error); setLoading(false); return }
    if (data) setUsers(data as ProfileRow[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleToggleRole = async (profile: ProfileRow) => {
    if (profile.id === currentUser?.id) {
      toast.error("You cannot change your own role")
      return
    }
    const newRole = profile.role === "admin" ? "user" : "admin"
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", profile.id)

    if (error) { toast.error("Failed to update role: " + error.message); return }
    toast.success(`${profile.display_name ?? "User"} is now ${newRole}`)
    setUsers((prev) => prev.map((u) => u.id === profile.id ? { ...u, role: newRole } : u))
  }

  const openDetail = async (profile: ProfileRow) => {
    setDetailUser(profile)
    setDetailOpen(true)
    setActivityLoading(true)
    setActivity(null)

    const [promptsRes, commentsRes, ratingsRes] = await Promise.all([
      supabase.from("pl_prompts").select("id, title, status").eq("created_by", profile.id).order("created_at", { ascending: false }),
      supabase.from("pl_comments").select("id, prompt_id, text, created_at").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("pl_user_ratings").select("prompt_id", { count: "exact", head: true }).eq("user_id", profile.id),
    ])

    setActivity({
      promptsAuthored: (promptsRes.data ?? []) as UserActivity["promptsAuthored"],
      comments: (commentsRes.data ?? []) as UserActivity["comments"],
      ratingsCount: ratingsRes.count ?? 0,
    })
    setActivityLoading(false)
  }

  const roleBadge = (role: string) => {
    if (role === "admin") return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
    return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
  }

  const statusColor = (s: string) => {
    if (s === "published") return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
    if (s === "pending_review") return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
    if (s === "rejected") return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300"
    return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300"
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No users</TableCell></TableRow>
              ) : users.map((u) => (
                <TableRow key={u.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(u)}>
                  <TableCell className="font-medium">{u.display_name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground">{u.department ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${roleBadge(u.role)}`}>
                      {u.role === "admin" ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">{new Date(u.updated_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* User Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:!max-w-lg p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-0 shrink-0">
            <SheetTitle>{detailUser?.display_name ?? "User Details"}</SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 min-h-0">
            {detailUser && (
              <div className="px-6 pb-6 space-y-5 mt-4">
                {/* Profile info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm">{detailUser.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${roleBadge(detailUser.role)}`}>{detailUser.role}</Badge>
                      {detailUser.id !== currentUser?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            handleToggleRole(detailUser)
                            setDetailUser((prev) => prev ? { ...prev, role: prev.role === "admin" ? "user" : "admin" } : prev)
                          }}
                        >
                          {detailUser.role === "admin" ? "Demote to User" : "Promote to Admin"}
                        </Button>
                      )}
                      {detailUser.id === currentUser?.id && (
                        <span className="text-xs text-muted-foreground">(You)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Department</span>
                    <span className="text-sm">{detailUser.department ?? "Not set"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Joined</span>
                    <span className="text-sm">{new Date(detailUser.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <Separator />

                {/* Activity */}
                {activityLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Loading activity...</p>
                ) : activity ? (
                  <div className="space-y-4">
                    {/* Prompts authored */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Prompts Authored ({activity.promptsAuthored.length})</h3>
                      </div>
                      {activity.promptsAuthored.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No prompts authored</p>
                      ) : (
                        <div className="space-y-1">
                          {activity.promptsAuthored.map((p) => (
                            <div key={p.id} className="flex items-center justify-between text-sm">
                              <span className="truncate">{p.title}</span>
                              <Badge variant="outline" className={`text-[10px] ml-2 shrink-0 ${statusColor(p.status)}`}>{p.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Ratings */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Ratings Given: {activity.ratingsCount}</h3>
                      </div>
                    </div>

                    {/* Comments */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Comments ({activity.comments.length})</h3>
                      </div>
                      {activity.comments.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No comments</p>
                      ) : (
                        <div className="space-y-2">
                          {activity.comments.slice(0, 10).map((c) => (
                            <div key={c.id} className="rounded border p-2">
                              <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                              <p className="text-sm line-clamp-2">{c.text}</p>
                            </div>
                          ))}
                          {activity.comments.length > 10 && (
                            <p className="text-xs text-muted-foreground">...and {activity.comments.length - 10} more</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
