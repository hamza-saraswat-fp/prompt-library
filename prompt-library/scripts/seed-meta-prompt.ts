/**
 * Seed a "Prompt Writing Guide" meta-prompt into the library.
 * Run: npx tsx scripts/seed-meta-prompt.ts
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

config({ path: ".env.local" })

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

const metaPrompt = {
  id: "prompt-writing-guide",
  title: "Prompt Writing Guide",
  overview:
    "Learn how to write effective prompts for the FieldPulse Prompt Library. This guide walks you through structuring a prompt, defining variables with placeholder text, and writing clear instructions that produce consistent results. Use it to create your own prompts for submission.",
  prompt_text: `You are helping me create a new prompt for the FieldPulse Prompt Library. The library stores reusable AI prompts that FieldPulse employees use across departments.

I need a prompt that accomplishes the following:

Task: {{task_description | Describe what the prompt should accomplish, e.g., "Generate a follow-up email after a sales demo"}}

Target audience: {{target_audience | Who will use this prompt? e.g., Sales team, Customer Success, Engineering}}

Desired output format: {{output_format | What should the AI produce? e.g., email, bullet points, code snippet, report}}

Tone & style: {{tone | What voice should the AI use? e.g., professional, conversational, technical}}

Please generate a well-structured prompt that:
1. Starts with a clear role or context statement for the AI
2. Includes 2-5 variables using the {{variable_name | example value}} syntax so other users can customize it
3. Provides specific instructions on what to include and what to avoid
4. Defines the expected output format and length
5. Is written clearly enough that someone unfamiliar with the task can use it effectively

Format your response as the raw prompt text I can copy and paste directly into the "Submit Prompt" form.`,
  departments: ["Sales", "Customer Success", "Implementation", "Engineering", "Product", "Marketing", "QA"],
  category_id: "documentation",
  models: ["Model-Agnostic"],
  variables: [
    { name: "task_description", description: "Describe what the prompt should accomplish" },
    { name: "target_audience", description: "Who will use this prompt?" },
    { name: "output_format", description: "What should the AI produce?" },
    { name: "tone", description: "What voice should the AI use?" },
  ],
  tags: ["Documentation", "Internal"],
  version: 1,
  copy_count: 0,
  is_trending: false,
  status: "published",
  visibility: "public",
  author: "FieldPulse Team",
  created_by: null,
  version_history: [
    { version: 1, date: new Date().toISOString().split("T")[0], author: "FieldPulse Team", changeDescription: "Initial version" },
  ],
  use_cases: [
    {
      title: "Creating a sales outreach prompt",
      input: 'task_description: "Write a cold outreach email for field service business owners", target_audience: "Sales team", output_format: "email", tone: "conversational"',
      output: "A ready-to-submit prompt with variables for prospect name, industry, company size, and pain points.",
    },
  ],
  comments: [],
}

async function main() {
  const { error } = await supabase.from("prompts").upsert([metaPrompt], { onConflict: "id" })

  if (error) {
    console.error("Failed to seed meta-prompt:", error.message)
    process.exit(1)
  }

  console.log("Seeded 'Prompt Writing Guide' meta-prompt successfully.")
}

main()
