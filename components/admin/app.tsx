"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { Award, BookOpen, CalendarDays, ClipboardList, ExternalLink, FileText, LayoutDashboard, LogOut, Mail, Menu, Settings, ShieldCheck, Users, X } from "lucide-react"
import { db, firebaseConfigured } from "@/lib/firebase"
import { AuthProvider, useAuth } from "./auth"
import { AchievementsAdmin, AdminsAdmin, ApplicationsAdmin, Dashboard, autoSeedIfEmpty, EventsAdmin, MessagesAdmin, RegistrationsAdmin, ResourcesAdmin, SettingsAdmin, TeamAdmin } from "./sections"
import { input } from "./ui"

type Item = { id: string; label: string; icon: typeof Users; desc: string; ownerOnly?: boolean }
const groups: { label?: string; items: Item[] }[] = [
  { items: [{ id: "dashboard", label: "Overview", icon: LayoutDashboard, desc: "A summary of the chapter website and what needs attention." }] },
  { label: "Content", items: [
    { id: "events", label: "Events", icon: CalendarDays, desc: "Upcoming and past events, with cover images and photo galleries." },
    { id: "team", label: "Team", icon: Users, desc: "Faculty, office bearers, department heads and volunteers shown on the Team page." },
    { id: "achievements", label: "Achievements", icon: Award, desc: "Wins and recognition featured on the home page." },
    { id: "resources", label: "Resources", icon: BookOpen, desc: "Learning links shown on the public Resources page." },
  ] },
  { label: "Inbox", items: [
    { id: "applications", label: "Applications", icon: FileText, desc: "Membership applications submitted through the Join form." },
    { id: "registrations", label: "Registrations", icon: ClipboardList, desc: "People who signed up for events. Export a CSV per event by searching the event name." },
    { id: "messages", label: "Messages", icon: Mail, desc: "Messages sent through the Contact form." },
  ] },
  { label: "Site", items: [
    { id: "settings", label: "Settings", icon: Settings, desc: "Contact email, address and map link shown across the website." },
    { id: "admins", label: "Admins & roles", icon: ShieldCheck, desc: "Who can sign in to this portal, and what they are allowed to do.", ownerOnly: true },
  ] },
]
const all = groups.flatMap((g) => g.items)

function Login() {
  const { login, user, logout } = useAuth()
  const [email, setEmail] = useState("")
  const [pw, setPw] = useState("")
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true)
    try { await login(email, pw) } catch (e) {
      const c = (e as { code?: string }).code || ""
      setErr(c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found") ? "Incorrect email or password." : c.includes("too-many") ? "Too many attempts. Try again later." : "Sign-in failed. " + ((e as Error).message || ""))
    }
    setBusy(false)
  }

  return (
    <div className="admin flex min-h-screen flex-col items-center justify-center bg-paper px-5">
      <div className="w-full max-w-[340px]">
        <div className="mb-8 flex items-center gap-3">
          <Image src="/images/acm-logo.png" alt="ACM" width={72} height={40} className="h-10 w-auto" />
          <div className="leading-tight"><p className="text-sm font-semibold text-ink">ACM Student Chapter</p><p className="text-[13px] text-muted">IILM University · Admin</p></div>
        </div>
        <div className="rounded-lg border border-line bg-white p-6 shadow-sm">
          <h1 className="text-base font-semibold text-ink">Sign in</h1>
          <p className="mt-1 text-[13px] text-muted">Use your administrator account to manage the website.</p>
          {!firebaseConfigured ? (
            <p className="mt-5 rounded-md bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-800">Firebase is not configured. Add your keys to <code>.env.local</code> (see <code>.env.example</code>) and restart the server.</p>
          ) : user ? (
            <div className="mt-5 space-y-3">
              <p className="rounded-md bg-red-50 p-3 text-[13px] text-red-700">{user.email} does not have admin access.</p>
              <button className="a-outline w-full" onClick={logout}>Sign out</button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block text-[13px] font-medium text-ink">Email<input className={`${input} mt-1.5 h-10`} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
              <label className="block text-[13px] font-medium text-ink">Password<input className={`${input} mt-1.5 h-10`} type="password" autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} /></label>
              {err && <p role="alert" className="text-[13px] text-red-600">{err}</p>}
              <button className="a-primary w-full" disabled={busy}>{busy ? "Signing in…" : "Continue"}</button>
            </form>
          )}
        </div>
        <Link href="/" className="mt-5 block text-center text-[13px] text-muted hover:text-ink">← Back to website</Link>
      </div>
    </div>
  )
}

function useUnread(col: string) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!db) return
    return onSnapshot(query(collection(db, col), where("status", "==", "new")), (s) => setN(s.size), () => setN(0))
  }, [col])
  return n
}

function Shell() {
  const { user, logout, role, canEdit, isOwner } = useAuth()
  const [section, setSection] = useState("dashboard")
  const [open, setOpen] = useState(false)
  const [syncMsg, setSyncMsg] = useState("")
  const unread: Record<string, number> = { applications: useUnread("applications"), messages: useUnread("messages") }

  const visible = groups.map((g) => ({ ...g, items: g.items.filter((i) => !i.ownerOnly || isOwner) })).filter((g) => g.items.length)

  useEffect(() => {
    if (!canEdit) return
    autoSeedIfEmpty().then((r) => {
      if (r === "seeded") setSyncMsg("Imported the website's current events, team and achievements into the admin portal.")
      if (r === "error") setSyncMsg("Could not read the database. Check that the rules in firestore.rules are published.")
      setTimeout(() => setSyncMsg(""), 8000)
    })
  }, [canEdit])

  useEffect(() => {
    const read = () => { const h = location.hash.slice(1); if (all.some((i) => i.id === h && (!i.ownerOnly || isOwner))) setSection(h) }
    read(); window.addEventListener("hashchange", read)
    return () => window.removeEventListener("hashchange", read)
  }, [isOwner])
  const go = (id: string) => { location.hash = id; setSection(id); setOpen(false); window.scrollTo({ top: 0 }) }
  const cur = all.find((i) => i.id === section)!
  const initials = (user?.email || "A").slice(0, 2).toUpperCase()

  const Nav = (
    <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
      {visible.map((g, gi) => (
        <div key={gi} className={gi ? "mt-5" : ""}>
          {g.label && <p className="mb-1.5 px-2.5 text-[13px] font-medium uppercase tracking-wider text-muted">{g.label}</p>}
          <ul className="space-y-0.5">
            {g.items.map((i) => (
              <li key={i.id}>
                <button onClick={() => go(i.id)} aria-current={section === i.id ? "page" : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${section === i.id ? "bg-line/60 font-medium text-ink" : "text-body hover:bg-line/40 hover:text-ink"}`}>
                  <i.icon className={`h-[18px] w-[18px] ${section === i.id ? "text-ink" : "text-muted"}`} />
                  <span className="flex-1 text-left">{i.label}</span>
                  {unread[i.id] > 0 && <span className="rounded-full bg-acm px-1.5 text-[11px] font-semibold leading-4 text-white">{unread[i.id]}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
  const Brand = (
    <div className="flex h-16 items-center gap-2.5 border-b border-line px-4">
      <Image src="/images/acm-logo.png" alt="ACM" width={72} height={40} className="h-7 w-auto" />
      <span className="text-sm font-semibold text-ink">Chapter Admin</span>
    </div>
  )
  const SiteLink = (
    <div className="border-t border-line p-3">
      <Link href="/" target="_blank" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-body hover:bg-line/40 hover:text-ink"><ExternalLink className="h-[18px] w-[18px] text-muted" /> View website</Link>
    </div>
  )

  return (
    <div className="admin min-h-screen bg-paper lg:pl-60">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-white lg:flex">{Brand}{Nav}{SiteLink}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50 [animation:a-fade_.2s_ease-out]" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[82%] max-w-[320px] flex-col rounded-r-2xl bg-white shadow-2xl [animation:a-slide-l_.22s_ease-out]">
            <div className="flex items-center justify-between px-5 pb-3 pt-5">
              <Image src="/images/acm-logo.png" alt="ACM" width={72} height={40} className="h-7 w-auto" />
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-body" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-4 w-4" /></button>
            </div>
            <div className="mx-4 mb-2 flex items-center gap-3 rounded-xl bg-paper p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">{initials}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{user?.email}</p>
                <p className="text-xs capitalize text-muted">{role}</p>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 pb-4" aria-label="Admin">
              {visible.map((g, gi) => (
                <div key={gi} className="mt-4">
                  {g.label && <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted">{g.label}</p>}
                  {g.items.map((i) => {
                    const on = section === i.id
                    return (
                      <button key={i.id} onClick={() => go(i.id)} aria-current={on ? "page" : undefined}
                        className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] transition-colors ${on ? "bg-acm/10 font-medium text-acm" : "text-body active:bg-paper"}`}>
                        {on && <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-acm" />}
                        <i.icon className="h-5 w-5" />
                        <span className="flex-1 text-left">{i.label}</span>
                        {unread[i.id] > 0 && <span className="rounded-full bg-acm px-2 text-xs font-semibold leading-5 text-white">{unread[i.id]}</span>}
                      </button>
                    )
                  })}
                </div>
              ))}
            </nav>
            <div className="flex gap-2 border-t border-line p-4">
              <Link href="/" target="_blank" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-paper py-2.5 text-sm text-body"><ExternalLink className="h-4 w-4" /> Website</Link>
              <button onClick={logout} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-paper py-2.5 text-sm text-body"><LogOut className="h-4 w-4" /> Sign out</button>
            </div>
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-2 text-sm">
          <button className="mr-1 rounded p-1.5 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-[18px] w-[18px]" /></button>
          <span className="text-muted">Admin</span><span className="text-line">/</span><span className="font-medium text-ink">{cur.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-[13px] text-muted sm:block">{user?.email} · <span className="capitalize">{role}</span></span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white" aria-hidden>{initials}</span>
          <button onClick={logout} className="rounded p-1.5 text-muted hover:bg-paper hover:text-ink" aria-label="Sign out" title="Sign out"><LogOut className="h-[18px] w-[18px]" /></button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{cur.label}</h1>
          <p className="mt-1 text-sm text-muted">{cur.desc}</p>
        </div>
        {syncMsg && <p role="status" className="mb-5 rounded-md border border-line bg-white px-4 py-3 text-sm text-ink">{syncMsg}</p>}
        {section === "dashboard" && <Dashboard go={go} />}
        {section === "events" && <EventsAdmin />}
        {section === "team" && <TeamAdmin />}
        {section === "achievements" && <AchievementsAdmin />}
        {section === "resources" && <ResourcesAdmin />}
        {section === "registrations" && <RegistrationsAdmin />}
        {section === "admins" && isOwner && <AdminsAdmin />}
        {section === "applications" && <ApplicationsAdmin />}
        {section === "messages" && <MessagesAdmin />}
        {section === "settings" && <SettingsAdmin />}
      </main>
    </div>
  )
}

function Gate() {
  const { isAdmin, loading } = useAuth()
  if (loading) return <div className="admin flex min-h-screen items-center justify-center bg-paper text-sm text-muted">Loading…</div>
  return isAdmin ? <Shell /> : <Login />
}

export function AdminApp() {
  return <AuthProvider><Gate /></AuthProvider>
}
