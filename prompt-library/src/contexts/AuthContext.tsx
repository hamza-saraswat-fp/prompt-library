import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User, Session, AuthError } from "@supabase/supabase-js"

export interface Profile {
  id: string
  display_name: string | null
  department: string | null
  role: string
  created_at: string
  updated_at: string
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function parseDisplayName(email: string): string {
  const prefix = email.split("@")[0]
  return prefix
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

async function fetchOrCreateProfile(user: User): Promise<Profile | null> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (existing) return existing as Profile

  const newProfile: Omit<Profile, "created_at" | "updated_at"> = {
    id: user.id,
    display_name: parseDisplayName(user.email ?? "User"),
    department: null,
    role: "user",
  }

  const { data: created, error } = await supabase
    .from("profiles")
    .upsert(newProfile)
    .select()
    .single()

  if (error) {
    console.error("Failed to create profile:", error)
    return null
  }

  return created as Profile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch/create profile when user changes
  useEffect(() => {
    if (user) {
      fetchOrCreateProfile(user).then(setProfile)
    } else {
      setProfile(null)
    }
  }, [user])

  const signIn = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
