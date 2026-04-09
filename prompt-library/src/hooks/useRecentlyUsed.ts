import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

const MAX_RECENT = 10

interface RecentEntry {
  id: string
  at: string
}

export function useRecentlyUsed() {
  const { user } = useAuth()
  const [recentIds, setRecentIds] = useState<string[]>([])

  useEffect(() => {
    if (!user) return
    supabase
      .from("profiles")
      .select("recently_used")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.recently_used) {
          const entries = data.recently_used as RecentEntry[]
          setRecentIds(entries.map((e) => e.id))
        }
      })
  }, [user])

  const addRecent = useCallback(
    (id: string) => {
      if (!user) return
      setRecentIds((prev) => {
        const next = [id, ...prev.filter((r) => r !== id)].slice(0, MAX_RECENT)
        const entries: RecentEntry[] = next.map((pid) => ({ id: pid, at: new Date().toISOString() }))
        supabase
          .from("profiles")
          .update({ recently_used: entries })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) console.error("Failed to sync recently used:", error)
          })
        return next
      })
    },
    [user]
  )

  return { recentIds, addRecent }
}
