import { useState, useEffect, useCallback, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import type { Prompt, Category, UseCaseGroup, Bundle } from "@/data/types"

interface SupabaseData {
  prompts: Prompt[]
  categories: Category[]
  groups: UseCaseGroup[]
  bundles: Bundle[]
  allTags: string[]
  departments: string[]
  loading: boolean
  error: string | null
  getGroupById: (id: string) => UseCaseGroup | undefined
  getCategoriesForGroup: (groupId: string) => Category[]
  getCategoryById: (id: string) => Category | undefined
}

interface DbPrompt {
  id: string
  title: string
  overview: string
  prompt_text: string
  departments: string[]
  category_id: string
  models: string[]
  variables: { name: string; description: string }[]
  tags: string[]
  version: number
  copy_count: number
  is_trending: boolean
  bundle_id: string | null
  author: string
  version_history: { version: number; date: string; author: string; changeDescription: string }[]
  use_cases: { title: string; input: string; output: string }[]
  comments: { id: string; author: string; text: string; createdAt: string }[]
  created_at: string
  updated_at: string
}

function toPrompt(row: DbPrompt): Prompt {
  return {
    id: row.id,
    title: row.title,
    overview: row.overview,
    promptText: row.prompt_text,
    departments: row.departments as Prompt["departments"],
    categoryId: row.category_id,
    models: row.models as Prompt["models"],
    variables: row.variables,
    tags: row.tags,
    version: row.version,
    copyCount: row.copy_count,
    isTrending: row.is_trending,
    bundleId: row.bundle_id ?? undefined,
    author: row.author,
    versionHistory: row.version_history,
    useCases: row.use_cases.length > 0 ? row.use_cases : undefined,
    comments: row.comments.length > 0 ? row.comments : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function useSupabaseData(): SupabaseData {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [groups, setGroups] = useState<UseCaseGroup[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAll() {
      try {
        // Fetch all tables in parallel
        const [groupsRes, catsRes, tagsRes, bundlesRes, promptsRes] = await Promise.all([
          supabase.from("pl_use_case_groups").select("*").order("sort_order"),
          supabase.from("pl_categories").select("*"),
          supabase.from("pl_tags").select("*"),
          supabase.from("pl_bundles").select("*").order("sort_order"),
          supabase.from("pl_prompts").select("*"),
        ])

        if (groupsRes.error) throw groupsRes.error
        if (catsRes.error) throw catsRes.error
        if (tagsRes.error) throw tagsRes.error
        if (bundlesRes.error) throw bundlesRes.error
        if (promptsRes.error) throw promptsRes.error

        // Transform categories: snake_case → camelCase
        const cats: Category[] = (catsRes.data ?? []).map((c: { id: string; name: string; group_id: string }) => ({
          id: c.id,
          name: c.name,
          groupId: c.group_id,
        }))

        // Reconstitute UseCaseGroup.categoryIds from categories
        const grps: UseCaseGroup[] = (groupsRes.data ?? []).map((g: { id: string; name: string; icon: string }) => ({
          id: g.id,
          name: g.name,
          icon: g.icon,
          categoryIds: cats.filter((c) => c.groupId === g.id).map((c) => c.id),
        }))

        // Derive department and tag lists
        const tagRows = tagsRes.data ?? []
        const depts = tagRows.filter((t: { type: string }) => t.type === "department").map((t: { id: string }) => t.id)
        const allTagNames = tagRows.map((t: { id: string }) => t.id)

        // Transform prompts
        const dbPrompts = (promptsRes.data ?? []) as DbPrompt[]
        const transformedPrompts = dbPrompts.map(toPrompt)

        // Reconstitute Bundle.promptIds from prompts
        const bdls: Bundle[] = (bundlesRes.data ?? []).map((b: { id: string; name: string; description: string }) => ({
          id: b.id,
          name: b.name,
          description: b.description,
          promptIds: transformedPrompts.filter((p) => p.bundleId === b.id).map((p) => p.id),
        }))

        setGroups(grps)
        setCategories(cats)
        setAllTags(allTagNames)
        setDepartments(depts)
        setBundles(bdls)
        setPrompts(transformedPrompts)
        setError(null)
      } catch (err) {
        console.error("Failed to load data from Supabase:", err)
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const getGroupById = useCallback(
    (id: string) => groups.find((g) => g.id === id),
    [groups]
  )

  const getCategoriesForGroup = useCallback(
    (groupId: string) => {
      const group = groups.find((g) => g.id === groupId)
      if (!group) return []
      return categories.filter((c) => group.categoryIds.includes(c.id))
    },
    [groups, categories]
  )

  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  )

  return useMemo(
    () => ({
      prompts, categories, groups, bundles, allTags, departments,
      loading, error,
      getGroupById, getCategoriesForGroup, getCategoryById,
    }),
    [prompts, categories, groups, bundles, allTags, departments, loading, error, getGroupById, getCategoriesForGroup, getCategoryById]
  )
}
