"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { adminEmails, auth, db } from "@/lib/firebase"
import type { Role } from "@/lib/types"

type Ctx = {
  user: User | null
  /** null = signed in but has no admin role (or signed out) */
  role: Role | null
  isAdmin: boolean
  canEdit: boolean
  isOwner: boolean
  loading: boolean
  login: (e: string, p: string) => Promise<void>
  logout: () => Promise<void>
}
const AuthCtx = createContext<Ctx>(null as unknown as Ctx)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) { setLoading(false); return }
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (!u?.email) { setRole(null); setLoading(false); return }
      const email = u.email.toLowerCase()
      if (adminEmails.includes(email)) { setRole("owner"); setLoading(false); return }
      try {
        const snap = db ? await getDoc(doc(db, "admins", email)) : null
        const r = snap?.exists() ? (snap.data().role as Role) : null
        setRole(r === "owner" || r === "editor" || r === "viewer" ? r : null)
      } catch { setRole(null) }
      setLoading(false)
    })
  }, [])

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase is not configured")
    await signInWithEmailAndPassword(auth, email.trim(), password)
  }
  const logout = async () => { if (auth) await signOut(auth) }

  return (
    <AuthCtx.Provider value={{ user, role, isAdmin: !!role, canEdit: role === "owner" || role === "editor", isOwner: role === "owner", loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}
