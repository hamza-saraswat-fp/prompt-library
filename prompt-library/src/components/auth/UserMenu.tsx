import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogOut, User, Mail, Loader2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

function getInitials(name: string | null, email: string | undefined): string {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return (email?.[0] ?? "?").toUpperCase()
}

export function UserMenu() {
  const { user, profile, signIn, signOut } = useAuth()
  const [signInOpen, setSignInOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("loading")
    setErrorMessage("")
    const { error } = await signIn(email.trim())
    if (error) {
      setStatus("error")
      setErrorMessage(error.message)
    } else {
      setStatus("success")
    }
  }

  const resetDialog = () => {
    setSignInOpen(false)
    setEmail("")
    setStatus("idle")
    setErrorMessage("")
  }

  // Not signed in — show sign-in button + dialog
  if (!user) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full cursor-pointer"
          onClick={() => setSignInOpen(true)}
        >
          <User className="h-4 w-4" />
        </Button>

        <Dialog open={signInOpen} onOpenChange={(open) => { if (!open) resetDialog() }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">
                <img src="/fp-logo.png" alt="FieldPulse" className="h-6 w-auto mx-auto mb-2 dark:invert" />
                Sign in to Prompt Library
              </DialogTitle>
            </DialogHeader>

            {status === "success" ? (
              <div className="text-center space-y-3 py-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="font-medium">Check your email</p>
                <p className="text-sm text-muted-foreground">
                  We sent a magic link to <span className="font-medium text-foreground">{email}</span>.
                </p>
                <Button variant="ghost" className="cursor-pointer text-sm" onClick={resetDialog}>
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="signin-email" className="text-sm font-medium">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@fieldpulse.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                      disabled={status === "loading"}
                    />
                  </div>
                </div>
                {status === "error" && <p className="text-sm text-red-500">{errorMessage}</p>}
                <Button type="submit" className="w-full cursor-pointer" disabled={status === "loading" || !email.trim()}>
                  {status === "loading" ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
                  ) : (
                    "Send Magic Link"
                  )}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Signed in — show avatar dropdown
  const initials = getInitials(profile?.display_name ?? null, user.email)
  const displayName = profile?.display_name ?? user.email ?? "User"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium cursor-pointer ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{displayName}</p>
          {user.email && (
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-600 dark:text-red-400">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
