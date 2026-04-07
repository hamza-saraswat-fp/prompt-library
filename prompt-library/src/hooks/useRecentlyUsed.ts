import { useState, useCallback } from "react"

const STORAGE_KEY = "prompt-library-recently-used"
const MAX_RECENT = 10

function loadRecent(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function useRecentlyUsed() {
  const [recentIds, setRecentIds] = useState<string[]>(loadRecent)

  const addRecent = useCallback((id: string) => {
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((r) => r !== id)].slice(0, MAX_RECENT)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { recentIds, addRecent }
}
