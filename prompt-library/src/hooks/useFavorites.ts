import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    if (!user) return
    supabase
      .from("profiles")
      .select("favorites")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.favorites) setFavorites(data.favorites as string[])
      })
  }, [user])

  const toggleFavorite = useCallback(
    (id: string) => {
      if (!user) return
      setFavorites((prev) => {
        const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        supabase
          .from("profiles")
          .update({ favorites: next })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) console.error("Failed to sync favorites:", error)
          })
        return next
      })
    },
    [user]
  )

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  )

  return { favorites, toggleFavorite, isFavorite }
}
