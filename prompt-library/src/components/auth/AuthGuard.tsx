import type { ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { LoginPage } from "@/components/auth/LoginPage"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return <>{children}</>
}
