import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { teams } from "@/data/teams"
import { extractVariables } from "@/lib/variables"
import type { ModelType } from "@/data/types"

const allModels: ModelType[] = ["ChatGPT", "Claude", "Gemini", "Model-Agnostic"]

interface SubmitPromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubmitPrompt({ open, onOpenChange }: SubmitPromptProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [promptText, setPromptText] = useState("")
  const [teamId, setTeamId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [selectedModels, setSelectedModels] = useState<ModelType[]>([])

  const detectedVars = extractVariables(promptText)

  const toggleModel = (model: ModelType) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    )
  }

  const canSubmit = title.trim() !== "" && promptText.trim() !== "" && teamId !== ""

  const handleSubmit = () => {
    if (!canSubmit) return
    toast.success("Prompt submitted for review!")
    setTitle("")
    setDescription("")
    setPromptText("")
    setTeamId("")
    setCategoryId("")
    setSelectedModels([])
    onOpenChange(false)
  }

  const handleTeamChange = (newTeamId: string) => {
    setTeamId(newTeamId)
    setCategoryId("") // reset category when team changes
  }

  const selectedTeam = teams.find((t) => t.id === teamId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit New Prompt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              className="mt-1"
              placeholder="e.g., Customer Onboarding Email"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              className="mt-1"
              placeholder="What does this prompt do and when should it be used?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Prompt Text</label>
            <textarea
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono min-h-[120px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={"Use {{variable_name}} for fillable fields..."}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
            {detectedVars.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground">Detected variables:</span>
                {detectedVars.map((v) => (
                  <Badge key={v} variant="secondary" className="text-[10px]">
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium">Team</label>
            <select
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={teamId}
              onChange={(e) => handleTeamChange(e.target.value)}
            >
              <option value="">Select team...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTeam && (
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select category...</option>
                {selectedTeam.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Models</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {allModels.map((model) => (
                <Button
                  key={model}
                  variant={selectedModels.includes(model) ? "default" : "outline"}
                  size="sm"
                  className="cursor-pointer text-xs"
                  onClick={() => toggleModel(model)}
                >
                  {model}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="cursor-pointer" onClick={handleSubmit} disabled={!canSubmit}>
            Submit for Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
