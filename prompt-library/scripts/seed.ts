/**
 * Seed script — populates Supabase with test data from hardcoded files.
 * Run: npx tsx scripts/seed.ts
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js"
import { prompts } from "../src/data/prompts"
import { useCaseGroups, categories, bundles } from "../src/data/teams"
import { config } from "dotenv"

config({ path: ".env.local" })

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

// Department tags
const DEPARTMENT_NAMES = ["Sales", "Customer Success", "Implementation", "Engineering", "Product", "Marketing", "QA"]

// All tags with their types
const ALL_TAGS = [
  ...DEPARTMENT_NAMES.map((t) => ({ id: t, type: "department" as const })),
  ...["Onboarding", "Documentation", "Troubleshooting", "Customer-Facing", "Internal", "Outreach", "Analysis", "Automation"].map((t) => ({ id: t, type: "workflow" as const })),
]

// Build a map of which prompts belong to which bundle
const bundlePromptMap = new Map<string, string>()
for (const b of bundles) {
  for (const pid of b.promptIds) {
    bundlePromptMap.set(pid, b.id)
  }
}

async function seed() {
  console.log("Seeding use_case_groups...")
  const { error: groupErr } = await supabase.from("use_case_groups").upsert(
    useCaseGroups.map((g, i) => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      sort_order: i,
    }))
  )
  if (groupErr) throw groupErr
  console.log(`  ✓ ${useCaseGroups.length} groups`)

  console.log("Seeding categories...")
  const { error: catErr } = await supabase.from("categories").upsert(
    categories.map((c) => ({
      id: c.id,
      name: c.name,
      group_id: c.groupId,
    }))
  )
  if (catErr) throw catErr
  console.log(`  ✓ ${categories.length} categories`)

  console.log("Seeding tags...")
  const { error: tagErr } = await supabase.from("tags").upsert(ALL_TAGS)
  if (tagErr) throw tagErr
  console.log(`  ✓ ${ALL_TAGS.length} tags`)

  console.log("Seeding bundles...")
  const { error: bundleErr } = await supabase.from("bundles").upsert(
    bundles.map((b, i) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      sort_order: i,
    }))
  )
  if (bundleErr) throw bundleErr
  console.log(`  ✓ ${bundles.length} bundles`)

  console.log("Seeding prompts...")
  const rows = prompts.map((p) => ({
    id: p.id,
    title: p.title,
    overview: p.overview,
    prompt_text: p.promptText,
    departments: p.departments,
    category_id: p.categoryId,
    models: p.models,
    variables: p.variables,
    tags: p.tags,
    version: p.version,
    copy_count: p.copyCount,
    is_trending: p.isTrending,
    bundle_id: bundlePromptMap.get(p.id) ?? null,
    author: p.author,
    created_by: null,
    status: "published",
    visibility: "public",
    version_history: p.versionHistory,
    use_cases: p.useCases ?? [],
    comments: p.comments ?? [],
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }))

  const { error: promptErr } = await supabase.from("prompts").upsert(rows)
  if (promptErr) throw promptErr
  console.log(`  ✓ ${rows.length} prompts`)

  console.log("\nSeed complete!")
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
