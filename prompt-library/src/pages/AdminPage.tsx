import { useState } from "react"
import { Navigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { PromptDrawer } from "@/components/prompts/PromptDrawer"
import { AdminPromptTable } from "@/components/admin/AdminPromptTable"
import { AdminSubmissionQueue } from "@/components/admin/AdminSubmissionQueue"
import { AdminTagManager } from "@/components/admin/AdminTagManager"
import { AdminCategoryManager } from "@/components/admin/AdminCategoryManager"
import { AdminBundleManager } from "@/components/admin/AdminBundleManager"
import { AdminUserManager } from "@/components/admin/AdminUserManager"
import { useRatings } from "@/hooks/useRatings"
import { useFavorites } from "@/hooks/useFavorites"
import { toast } from "sonner"
import type { Prompt } from "@/data/types"

export function AdminPage() {
  const { profile } = useAuth()
  const { getRating, vote } = useRatings()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [previewPrompt, setPreviewPrompt] = useState<Prompt | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  if (profile?.role !== "admin") {
    return <Navigate to="/" replace />
  }

  const handlePreview = (prompt: Prompt) => {
    setPreviewPrompt(prompt)
    setPreviewOpen(true)
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard!")
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage prompts, submissions, and settings</p>
      </div>

      <Tabs defaultValue="prompts">
        <TabsList variant="line">
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="submissions">Submissions{pendingCount > 0 ? ` (${pendingCount})` : ""}</TabsTrigger>
          <TabsTrigger value="tags">Tags & Categories</TabsTrigger>
          <TabsTrigger value="bundles">Bundles</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="mt-4">
          <AdminPromptTable onPreview={handlePreview} />
        </TabsContent>

        <TabsContent value="submissions" className="mt-4">
          <AdminSubmissionQueue onCountChange={setPendingCount} />
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-3">Tags</h2>
              <AdminTagManager />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-3">Categories</h2>
              <AdminCategoryManager />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bundles" className="mt-4">
          <AdminBundleManager />
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <AdminUserManager />
        </TabsContent>
      </Tabs>

      <PromptDrawer
        prompt={previewPrompt}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onCopy={handleCopy}
        isFavorite={previewPrompt ? isFavorite(previewPrompt.id) : false}
        onToggleFavorite={() => previewPrompt && toggleFavorite(previewPrompt.id)}
        onOpenFullView={() => setPreviewOpen(false)}
        rating={previewPrompt ? getRating(previewPrompt.id) : { up: 0, down: 0, userVote: null, net: 0 }}
        onVote={vote}
      />
    </div>
  )
}
