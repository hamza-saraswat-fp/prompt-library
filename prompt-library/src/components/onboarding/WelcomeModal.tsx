import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Search, PenLine, Plus } from "lucide-react"

const STORAGE_KEY = "fp-onboarding-seen"

interface WelcomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const steps = [
  {
    icon: Sparkles,
    title: "Welcome to the Prompt Library",
    description:
      "Your team's collection of AI prompts for FieldPulse. Browse proven prompts for sales, customer success, engineering, and more — or create your own to share with the team.",
  },
  {
    icon: Search,
    title: "Browse & Search",
    description:
      "Use the sidebar to browse by department (Sales, Engineering, etc.) or search by keyword. Filter by tags to narrow down results. Favorite prompts you use often for quick access.",
  },
  {
    icon: PenLine,
    title: "Fill Variables & Copy",
    description:
      "Many prompts have customizable fields highlighted in purple. Fill in the form fields on the right to personalize the prompt, then click \"Copy Filled Prompt\" to copy it — or open it directly in ChatGPT, Claude, or Gemini.",
  },
  {
    icon: Plus,
    title: "Submit Your Own",
    description:
      "Have a prompt that works well? Click \"Submit Prompt\" in the sidebar to share it with the team. Use {{variable_name}} syntax to create fillable fields. Check out the \"Prompt Writing Guide\" in the library for tips.",
  },
]

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const [step, setStep] = useState(0)

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true")
    setStep(0)
    onOpenChange(false)
  }

  const currentStep = steps[step]
  const Icon = currentStep.icon
  const isLast = step === steps.length - 1

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleDismiss() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{currentStep.title}</DialogTitle>
          <DialogDescription className="text-center text-sm leading-relaxed">
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 py-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="cursor-pointer"
          >
            Back
          </Button>
          <div className="flex gap-2">
            {!isLast && (
              <Button variant="ghost" onClick={handleDismiss} className="cursor-pointer text-muted-foreground">
                Skip
              </Button>
            )}
            <Button
              onClick={isLast ? handleDismiss : () => setStep((s) => s + 1)}
              className="cursor-pointer"
            >
              {isLast ? "Get Started" : "Next"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Check if onboarding has been completed */
export function hasSeenOnboarding(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true"
}
