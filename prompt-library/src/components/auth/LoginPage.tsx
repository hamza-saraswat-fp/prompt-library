import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Mail, Loader2, CheckCircle2 } from "lucide-react"

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <img
            src="/fp-logo.png"
            alt="FieldPulse"
            className="h-8 w-auto mx-auto dark:invert"
          />
          <h1 className="text-2xl font-bold">Prompt Library</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your email to continue
          </p>
        </div>

        {status === "success" ? (
          <div className="rounded-lg border bg-card p-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="font-medium">Check your email</p>
            <p className="text-sm text-muted-foreground">
              We sent a magic link to <span className="font-medium text-foreground">{email}</span>.
              Click the link in the email to sign in.
            </p>
            <Button
              variant="ghost"
              className="cursor-pointer text-sm"
              onClick={() => { setStatus("idle"); setEmail("") }}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
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

            {status === "error" && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={status === "loading" || !email.trim()}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Magic Link"
              )}
            </Button>
          </form>
        )}

        <p className="text-center text-xs text-muted-foreground">
          AI for the Field
        </p>
      </div>
    </div>
  )
}
