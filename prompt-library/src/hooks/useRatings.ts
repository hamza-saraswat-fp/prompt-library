import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export interface RatingInfo {
  up: number
  down: number
  userVote: "up" | "down" | null
  net: number
}

type VoteDirection = "up" | "down"

export function useRatings() {
  const { user } = useAuth()
  const [userVotes, setUserVotes] = useState<Record<string, VoteDirection>>({})
  const [aggregates, setAggregates] = useState<Record<string, { up: number; down: number }>>({})

  useEffect(() => {
    if (!user) return

    // Fetch user's own votes + aggregates in parallel
    Promise.all([
      supabase.from("user_ratings").select("prompt_id, vote").eq("user_id", user.id),
      supabase.from("prompt_ratings_summary").select("*"),
    ]).then(([votesRes, aggRes]) => {
      if (votesRes.data) {
        const votes: Record<string, VoteDirection> = {}
        for (const row of votesRes.data) {
          votes[row.prompt_id] = row.vote as VoteDirection
        }
        setUserVotes(votes)
      }
      if (aggRes.data) {
        const agg: Record<string, { up: number; down: number }> = {}
        for (const row of aggRes.data) {
          agg[row.prompt_id] = { up: Number(row.up_count), down: Number(row.down_count) }
        }
        setAggregates(agg)
      }
    })
  }, [user])

  const getRating = useCallback(
    (promptId: string): RatingInfo => {
      const agg = aggregates[promptId] ?? { up: 0, down: 0 }
      return { up: agg.up, down: agg.down, userVote: userVotes[promptId] ?? null, net: agg.up - agg.down }
    },
    [userVotes, aggregates]
  )

  const getNetScore = useCallback(
    (promptId: string): number => {
      const agg = aggregates[promptId]
      return agg ? agg.up - agg.down : 0
    },
    [aggregates]
  )

  const vote = useCallback(
    (promptId: string, direction: VoteDirection) => {
      if (!user) return
      const currentVote = userVotes[promptId] ?? null

      if (currentVote === direction) {
        // Toggle off — delete the row
        setUserVotes((prev) => { const n = { ...prev }; delete n[promptId]; return n })
        setAggregates((prev) => {
          const agg = prev[promptId] ?? { up: 0, down: 0 }
          return { ...prev, [promptId]: { ...agg, [direction]: Math.max(0, agg[direction] - 1) } }
        })
        supabase.from("user_ratings").delete().eq("user_id", user.id).eq("prompt_id", promptId)
          .then(({ error }) => { if (error) console.error("Failed to delete vote:", error) })
      } else if (currentVote === null) {
        // New vote — insert
        setUserVotes((prev) => ({ ...prev, [promptId]: direction }))
        setAggregates((prev) => {
          const agg = prev[promptId] ?? { up: 0, down: 0 }
          return { ...prev, [promptId]: { ...agg, [direction]: agg[direction] + 1 } }
        })
        supabase.from("user_ratings").insert({ user_id: user.id, prompt_id: promptId, vote: direction })
          .then(({ error }) => { if (error) console.error("Failed to insert vote:", error) })
      } else {
        // Switch vote — update
        setUserVotes((prev) => ({ ...prev, [promptId]: direction }))
        setAggregates((prev) => {
          const agg = prev[promptId] ?? { up: 0, down: 0 }
          return {
            ...prev,
            [promptId]: {
              [currentVote]: Math.max(0, agg[currentVote] - 1),
              [direction]: agg[direction] + 1,
            } as { up: number; down: number },
          }
        })
        supabase.from("user_ratings").update({ vote: direction, updated_at: new Date().toISOString() })
          .eq("user_id", user.id).eq("prompt_id", promptId)
          .then(({ error }) => { if (error) console.error("Failed to update vote:", error) })
      }
    },
    [user, userVotes]
  )

  return { getRating, vote, getNetScore }
}
