import type { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AdminDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: ReactNode
  promptTitle?: string
  onConfirm: () => void
  deleting: boolean
  confirmLabel?: string
}

export function AdminDeleteDialog({
  open, onOpenChange, title, description, promptTitle, onConfirm, deleting, confirmLabel = "Delete",
}: AdminDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title ?? "Delete Prompt"}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          {description ?? (
            <p>Are you sure you want to delete <span className="font-medium text-foreground">"{promptTitle}"</span>? This cannot be undone.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" className="cursor-pointer" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
