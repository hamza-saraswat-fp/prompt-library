import { useState, useCallback } from "react"

const STORAGE_KEY = "prompt-library-ratings"

interface PromptRating {
  up: number
  down: number
  userVote: "up" | "down" | null
}

export interface RatingInfo {
  up: number
  down: number
  userVote: "up" | "down" | null
  net: number
}

type RatingsMap = Record<string, PromptRating>

function loadRatings(): RatingsMap {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

export function useRatings() {
  const [ratings, setRatings] = useState<RatingsMap>(loadRatings)

  const getRating = useCallback(
    (promptId: string): RatingInfo => {
      const r = ratings[promptId] ?? { up: 0, down: 0, userVote: null }
      return { ...r, net: r.up - r.down }
    },
    [ratings]
  )

  const getNetScore = useCallback(
    (promptId: string): number => {
      const r = ratings[promptId]
      return r ? r.up - r.down : 0
    },
    [ratings]
  )

  const vote = useCallback((promptId: string, direction: "up" | "down") => {
    setRatings((prev) => {
      const current = prev[promptId] ?? { up: 0, down: 0, userVote: null }
      const next = { ...current }

      if (current.userVote === direction) {
        // Toggle off
        next[direction] = Math.max(0, next[direction] - 1)
        next.userVote = null
      } else if (current.userVote === null) {
        // New vote
        next[direction] += 1
        next.userVote = direction
      } else {
        // Switch vote
        const opposite = current.userVote
        next[opposite] = Math.max(0, next[opposite] - 1)
        next[direction] += 1
        next.userVote = direction
      }

      const updated = { ...prev, [promptId]: next }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return { getRating, vote, getNetScore }
}
