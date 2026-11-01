"use client"
import { useEffect, useState } from "react"
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, writeBatch } from "firebase/firestore"
import { getApps, initializeApp } from "firebase/app"
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signOut } from "firebase/auth"
import { ArrowDown, ArrowUp, BookOpen, CalendarDays, FileText, GripVertical, Mail, Send, Trash2, UserPlus, Users } from "lucide-react"
import { adminEmails, app, auth, db } from "@/lib/firebase"
import { useAuth } from "./auth"
import { seedAchievements, seedEvents, seedMembers, seedResources, seedSettings } from "@/lib/seed"
import type { AdminDoc, Role, SettingsDoc } from "@/lib/types"
import { CrudManager, type FieldDef } from "./crud"
import { Badge, fmtDate, input, Label } from "./ui"

/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
const thumb = (src: string, round = false) => src
  ? <img src={src} alt="" className={`h-10 w-9 object-cover ring-1 ring-line ${round ? "rounded-full" : "rounded-md"}`} />
  : <span className={`flex h-10 w-9 items-center justify-center bg-paper text-[13px] text-muted ring-1 ring-line ${round ? "rounded-full" : "rounded-md"}`}>–</span>

const longDate = (iso: string) => iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""

/* ---------- Events ---------- */
const eventFields: FieldDef[] = [
  { key: "title", label: "Title", type: "text", required: true, full: true },
  { key: "status", label: "Status", type: "select", options: [{ value: "upcoming", label: "Upcoming" }, { value: "past", label: "Past" }], required: true },
  { key: "type", label: "Type", type: "text", required: true, placeholder: "Workshop, Seminar, Competition…" },
  { key: "registration", label: "Registration", type: "select", options: [{ value: "open", label: "Open (upcoming events only)" }, { value: "closed", label: "Closed" }], hint: "Shows a sign-up form on the event page" },
  { key: "sortDate", label: "Date", type: "date", required: true },
  { key: "time", label: "Time", type: "text", placeholder: "1:30 – 3:00 PM" },
  { key: "venue", label: "Venue", type: "text", required: true },
  { key: "speaker", label: "Speaker / guest", type: "text" },
  { key: "attendees", label: "Participants", type: "number" },
  { key: "summary", label: "Description", type: "textarea", required: true },
  { key: "highlights", label: "Highlights", type: "list", hint: "Comma-separated", full: true },
  { key: "image", label: "Cover image", type: "image" },
  { key: "gallery", label: "Gallery photos", type: "images" },
]
export const EventsAdmin = () => (
  <CrudManager col="events" singular="Event" plural="Events" fields={eventFields} idFrom="title"
    defaults={{ status: "upcoming", registration: "open", type: "", sortDate: "", time: "", venue: "", speaker: "", attendees: 0, summary: "", highlights: [], image: "", gallery: [] }}
    sort={(a, b) => (b.sortDate || "").localeCompare(a.sortDate || "")}
    transform={(d) => ({ ...d, date: longDate(d.sortDate) })}
    columns={[
      { key: "image", label: "", render: (r) => thumb(r.image) },
      { key: "title", label: "Event", render: (r) => <div><p className="font-medium text-ink">{r.title}</p><p className="text-[13px] text-muted">{r.type}</p></div> },
      { key: "date", label: "Date" },
      { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "upcoming" ? "green" : "gray"}>{r.status}</Badge> },
      { key: "registration", label: "Registration", render: (r) => r.status === "upcoming" ? <Badge tone={r.registration === "closed" ? "gray" : "blue"}>{r.registration === "closed" ? "closed" : "open"}</Badge> : <span className="text-muted">–</span> },
      { key: "attendees", label: "Participants" },
    ]} />
)

/* ---------- Team ---------- */
const groups = [{ value: "faculty", label: "Faculty mentor" }, { value: "officer", label: "Office bearer" }, { value: "lead", label: "Department head" }, { value: "volunteer", label: "Volunteer" }]
const memberFields: FieldDef[] = [
  { key: "name", label: "Full name", type: "text", required: true },
  { key: "role", label: "Role / designation", type: "text", required: true },
  { key: "group", label: "Section on Team page", type: "select", options: groups, required: true },
  { key: "order", label: "Display order", type: "number", hint: "Lower numbers appear first" },
  { key: "dept", label: "Department", type: "text", hint: "Faculty only" },
  { key: "email", label: "Email", type: "email" },
  { key: "linkedin", label: "LinkedIn URL", type: "text", full: true },
  { key: "skills", label: "Skills / areas", type: "list", hint: "Comma-separated", full: true },
  { key: "image", label: "Photo", type: "avatar" },
]
const TeamList = () => (
  <CrudManager col="members" singular="Member" plural="Members" fields={memberFields} idFrom="name"
    defaults={{ name: "", role: "", group: "volunteer", order: 99, dept: "", email: "", linkedin: "", skills: [], image: "" }}
    sort={(a, b) => groups.findIndex((g) => g.value === a.group) - groups.findIndex((g) => g.value === b.group) || (a.order ?? 0) - (b.order ?? 0)}
    columns={[
      { key: "image", label: "", render: (r) => thumb(r.image, true) },
      { key: "name", label: "Name", render: (r) => <div><p className="font-medium text-ink">{r.name}</p><p className="text-[13px] text-muted">{r.role}</p></div> },
      { key: "group", label: "Section", render: (r) => <span className="rounded bg-paper px-2 py-0.5 text-[13px] text-body ring-1 ring-line">{groups.find((g) => g.value === r.group)?.label || r.group}</span> },
      { key: "order", label: "Order" },
    ]} />
)

function TeamReorder() {
  const { canEdit } = useAuth()
  const [rows, setRows] = useState<any[]>([])
  const [drag, setDrag] = useState<{ id: string; group: string } | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [note, setNote] = useState("")

  useEffect(() => {
    if (!db) return
    return onSnapshot(collection(db, "members"), (s) => setRows(s.docs.map((d) => ({ ...d.data(), id: d.id }))))
  }, [])
  const inGroup = (g: string) => rows.filter((r) => r.group === g).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  async function commit(group: string, list: any[]) {
    setRows((prev) => [...prev.filter((r) => r.group !== group), ...list.map((r, i) => ({ ...r, order: i + 1 }))]) // optimistic
    try {
      const b = writeBatch(db!)
      list.forEach((r, i) => { if (r.order !== i + 1) b.update(doc(db!, "members", r.id), { order: i + 1 }) })
      await b.commit(); setNote("Order saved"); setTimeout(() => setNote(""), 2500)
    } catch (e) { setNote("Could not save order: " + (e as Error).message) }
  }
  function move(group: string, from: number, to: number) {
    const list = inGroup(group)
    if (to < 0 || to >= list.length || from === to) return
    const [it] = list.splice(from, 1); list.splice(to, 0, it)
    commit(group, list)
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{canEdit ? "Drag a row (or use the arrows) to change the order shown on the Team page. Changes save automatically." : "Read-only access: you can see the order but not change it."} {note && <span className="ml-2 font-medium text-ink">{note}</span>}</p>
      {groups.map((g) => {
        const list = inGroup(g.value)
        return (
          <section key={g.value} className="overflow-hidden rounded-lg border border-line bg-white">
            <h3 className="border-b border-line bg-paper/70 px-4 py-2.5 text-[13px] font-medium uppercase tracking-wide text-muted">{g.label}s <span className="ml-1 normal-case tracking-normal">({list.length})</span></h3>
            {list.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted">No members in this section.</p>}
            <ul>
              {list.map((m, i) => (
                <li key={m.id} draggable={canEdit}
                  onDragStart={() => setDrag({ id: m.id, group: g.value })}
                  onDragEnd={() => { setDrag(null); setOver(null) }}
                  onDragOver={(e) => { if (drag && drag.group === g.value) { e.preventDefault(); setOver(m.id) } }}
                  onDrop={(e) => { e.preventDefault(); if (drag && drag.group === g.value) move(g.value, list.findIndex((x) => x.id === drag.id), i); setDrag(null); setOver(null) }}
                  className={`flex items-center gap-3 border-b border-line px-3 py-2 last:border-0 ${drag?.id === m.id ? "opacity-40" : ""} ${over === m.id && drag?.id !== m.id ? "bg-acm-soft" : "bg-white"}`}>
                  <GripVertical className={`h-4 w-4 shrink-0 ${canEdit ? "cursor-grab text-muted" : "text-line"}`} />
                  <span className="w-5 text-right text-xs tabular-nums text-muted">{i + 1}</span>
                  {thumb(m.image, true)}
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{m.name}</p><p className="truncate text-xs text-muted">{m.role}</p></div>
                  {canEdit && (
                    <div className="flex gap-0.5">
                      <button aria-label={`Move ${m.name} up`} disabled={i === 0} onClick={() => move(g.value, i, i - 1)} className="rounded p-1.5 text-muted hover:bg-paper hover:text-ink disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                      <button aria-label={`Move ${m.name} down`} disabled={i === list.length - 1} onClick={() => move(g.value, i, i + 1)} className="rounded p-1.5 text-muted hover:bg-paper hover:text-ink disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export function TeamAdmin() {
  const [view, setView] = useState<"list" | "order">("list")
  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-line bg-white p-0.5 text-sm" role="tablist">
        {([["list", "All members"], ["order", "Reorder"]] as const).map(([v, l]) => (
          <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`rounded px-3.5 py-1.5 font-medium ${view === v ? "bg-ink text-white" : "text-body hover:text-ink"}`}>{l}</button>
        ))}
      </div>
      {view === "list" ? <TeamList /> : <TeamReorder />}
    </div>
  )
}

/* ---------- Achievements ---------- */
export const AchievementsAdmin = () => (
  <CrudManager col="achievements" singular="Achievement" plural="Achievements" idFrom="title"
    fields={[
      { key: "title", label: "Title", type: "text", required: true },
      { key: "order", label: "Display order", type: "number" },
      { key: "note", label: "Description", type: "textarea", required: true },
      { key: "image", label: "Image", type: "image" },
    ]}
    defaults={{ title: "", note: "", image: "", order: 99 }}
    sort={(a, b) => (a.order ?? 0) - (b.order ?? 0)}
    columns={[
      { key: "image", label: "", render: (r) => thumb(r.image) },
      { key: "title", label: "Title", render: (r) => <span className="font-medium text-ink">{r.title}</span> },
      { key: "note", label: "Description" },
      { key: "order", label: "Order" },
    ]} />
)

/* ---------- Applications & messages (inbox) ---------- */
const appStatus = [
  { value: "new", label: "New", tone: "blue" as const }, { value: "reviewing", label: "Reviewing", tone: "amber" as const },
  { value: "accepted", label: "Accepted", tone: "green" as const }, { value: "rejected", label: "Rejected", tone: "red" as const },
]
const byNewest = (a: any, b: any) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
const tone = (list: { value: string; tone: any }[], v: string) => list.find((x) => x.value === v)?.tone || "gray"

export const ApplicationsAdmin = () => (
  <CrudManager col="applications" singular="Application" plural="Applications" csv inbox={{ statusOptions: appStatus }} idFrom="name"
    fields={[
      { key: "name", label: "Name", type: "text" }, { key: "email", label: "Email", type: "text" },
      { key: "program", label: "Programme", type: "text" }, { key: "year", label: "Year", type: "text" },
      { key: "interest", label: "Interest", type: "text", full: true }, { key: "why", label: "Why they want to join", type: "textarea" },
    ]}
    defaults={{}} sort={byNewest}
    columns={[
      { key: "name", label: "Applicant", render: (r) => <div><p className="font-medium text-ink">{r.name}</p><p className="text-[13px] text-muted">{r.email}</p></div> },
      { key: "program", label: "Programme", render: (r) => `${r.program} · ${r.year} yr` },
      { key: "interest", label: "Interest" },
      { key: "createdAt", label: "Received", render: (r) => <span className="text-[13px]">{fmtDate(r.createdAt)}</span> },
      { key: "status", label: "Status", render: (r) => <Badge tone={tone(appStatus, r.status)}>{r.status}</Badge> },
    ]} />
)

const msgStatus = [{ value: "new", label: "New", tone: "blue" as const }, { value: "read", label: "Read", tone: "gray" as const }, { value: "replied", label: "Replied", tone: "green" as const }]
export const MessagesAdmin = () => (
  <CrudManager col="messages" singular="Message" plural="Messages" csv inbox={{ statusOptions: msgStatus }} idFrom="subject"
    fields={[
      { key: "name", label: "Name", type: "text" }, { key: "email", label: "Email", type: "text" },
      { key: "subject", label: "Subject", type: "text", full: true }, { key: "message", label: "Message", type: "textarea" },
    ]}
    defaults={{}} sort={byNewest}
    columns={[
      { key: "name", label: "From", render: (r) => <div><p className="font-medium text-ink">{r.name}</p><p className="text-[13px] text-muted">{r.email}</p></div> },
      { key: "subject", label: "Subject" },
      { key: "createdAt", label: "Received", render: (r) => <span className="text-[13px]">{fmtDate(r.createdAt)}</span> },
      { key: "status", label: "Status", render: (r) => <Badge tone={tone(msgStatus, r.status)}>{r.status}</Badge> },
    ]} />
)

/* ---------- Resources ---------- */
const resCats = ["ACM", "Learn to code", "Practice", "Career & open source"]
export const ResourcesAdmin = () => (
  <CrudManager col="resources" singular="Resource" plural="Resources" idFrom="title"
    fields={[
      { key: "title", label: "Title", type: "text", required: true },
      { key: "category", label: "Category", type: "text", required: true, hint: `Existing: ${resCats.join(", ")}. A new name creates a new section.` },
      { key: "url", label: "Link (URL)", type: "text", required: true, full: true, placeholder: "https://…" },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "order", label: "Display order", type: "number" },
    ]}
    defaults={{ title: "", category: "Learn to code", url: "", description: "", order: 99 }}
    sort={(a, b) => resCats.indexOf(a.category) - resCats.indexOf(b.category) || (a.order ?? 0) - (b.order ?? 0)}
    columns={[
      { key: "title", label: "Resource", render: (r) => <div><p className="font-medium text-ink">{r.title}</p><p className="truncate text-xs text-muted">{r.url}</p></div> },
      { key: "category", label: "Category" },
      { key: "order", label: "Order" },
    ]} />
)

/* ---------- Registrations (event sign-ups) ---------- */
const regStatus = [{ value: "registered", label: "Registered", tone: "blue" as const }, { value: "attended", label: "Attended", tone: "green" as const }, { value: "cancelled", label: "Cancelled", tone: "gray" as const }]
export const RegistrationsAdmin = () => (
  <CrudManager col="registrations" singular="Registration" plural="Registrations" csv inbox={{ statusOptions: regStatus }} idFrom="name"
    fields={[
      { key: "eventTitle", label: "Event", type: "text", full: true }, { key: "name", label: "Name", type: "text" }, { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" }, { key: "program", label: "Programme", type: "text" }, { key: "year", label: "Year", type: "text" },
    ]}
    defaults={{}} sort={byNewest}
    columns={[
      { key: "name", label: "Attendee", render: (r) => <div><p className="font-medium text-ink">{r.name}</p><p className="text-xs text-muted">{r.email}</p></div> },
      { key: "eventTitle", label: "Event" },
      { key: "program", label: "Programme", render: (r) => `${r.program} · ${r.year} yr` },
      { key: "createdAt", label: "Registered", render: (r) => <span className="text-xs">{fmtDate(r.createdAt)}</span> },
      { key: "status", label: "Status", render: (r) => <Badge tone={tone(regStatus, r.status)}>{r.status}</Badge> },
    ]} />
)

/* ---------- Admins & roles (owner only) ---------- */
const roleInfo: Record<Role, string> = {
  owner: "Full access, including managing other admins.",
  editor: "Edit all website content and manage applications, registrations and messages.",
  viewer: "Read-only access to everything in the portal.",
}
const randomPassword = () => { const a = new Uint8Array(18); crypto.getRandomValues(a); return btoa(String.fromCharCode(...a)).replace(/[^a-zA-Z0-9]/g, "x") + "Aa1!" }

export function AdminsAdmin() {
  const { user } = useAuth()
  const [rows, setRows] = useState<AdminDoc[]>([])
  const [form, setForm] = useState({ name: "", email: "", role: "editor" as Role })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (!db) return
    return onSnapshot(collection(db, "admins"), (s) => setRows(s.docs.map((d) => ({ ...(d.data() as object), id: d.id }) as AdminDoc)), (e) => setMsg({ ok: false, text: e.message }))
  }, [])

  async function add(e: React.FormEvent) {
    e.preventDefault(); setMsg(null)
    const email = form.email.trim().toLowerCase()
    if (adminEmails.includes(email) || rows.some((r) => r.id === email)) return setMsg({ ok: false, text: "That email already has admin access." })
    setBusy(true)
    let note = ""
    try {
      // Create the sign-in account on a secondary Firebase app so the current session is not affected.
      try {
        const second = getApps().find((a) => a.name === "secondary") ?? initializeApp(app!.options, "secondary")
        const sa = getAuth(second)
        await createUserWithEmailAndPassword(sa, email, randomPassword())
        await signOut(sa)
        note = "Account created. "
      } catch (err) {
        const c = (err as { code?: string }).code
        if (c === "auth/email-already-in-use") note = "They already have a sign-in account. "
        else if (c === "auth/operation-not-allowed" || c === "auth/admin-restricted-operation") note = "Sign-ups are disabled in Firebase, so create their user in Authentication → Users yourself. "
        else throw err
      }
      await setDoc(doc(db!, "admins", email), { email, name: form.name.trim(), role: form.role })
      try { await sendPasswordResetEmail(auth!, email); note += "A password-setup email was sent to them." } catch { note += "Could not send the setup email; use “Send setup email” on their row." }
      setMsg({ ok: true, text: `Added ${email} as ${form.role}. ${note}` })
      setForm({ name: "", email: "", role: "editor" })
    } catch (err) { setMsg({ ok: false, text: (err as Error).message }) }
    setBusy(false)
  }

  async function setRole(id: string, role: Role) { try { await setDoc(doc(db!, "admins", id), { role }, { merge: true }) } catch (e) { setMsg({ ok: false, text: (e as Error).message }) } }
  async function remove(id: string) {
    try { await deleteDoc(doc(db!, "admins", id)); setMsg({ ok: true, text: `${id} no longer has admin access. Their sign-in account still exists but can do nothing.` }) } catch (e) { setMsg({ ok: false, text: (e as Error).message }) }
  }
  async function reset(id: string) {
    try { await sendPasswordResetEmail(auth!, id); setMsg({ ok: true, text: `Password-setup email sent to ${id}.` }) } catch (e) { setMsg({ ok: false, text: (e as Error).message }) }
  }

  const me = user?.email?.toLowerCase()
  const field = `${input} h-10`
  return (
    <div className="space-y-6">
      <form onSubmit={add} className="rounded-lg border border-line bg-white p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink"><UserPlus className="h-4 w-4 text-muted" /> Add an admin</h2>
        <p className="mt-1 text-sm text-muted">They get an email to set their own password, then sign in at this page.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.4fr_160px_auto]">
          <input className={field} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required aria-label="Name" />
          <input className={field} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required aria-label="Email" />
          <select className={field} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} aria-label="Role"><option value="editor">Editor</option><option value="viewer">Viewer</option><option value="owner">Owner</option></select>
          <button className="a-primary" disabled={busy}>{busy ? "Adding…" : "Add admin"}</button>
        </div>
        <p className="mt-2 text-xs text-muted">{roleInfo[form.role]}</p>
        {msg && <p role="status" className={`mt-3 rounded-md px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      </form>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper/70 text-xs font-medium uppercase tracking-wide text-muted"><tr><th className="px-4 py-2.5">Admin</th><th className="px-4 py-2.5">Role</th><th className="px-4 py-2.5"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody className="divide-y divide-line">
            {adminEmails.map((e) => (
              <tr key={e}><td className="px-4 py-3"><p className="font-medium text-ink">{e}</p><p className="text-xs text-muted">Root owner (set in configuration)</p></td><td className="px-4 py-3"><Badge tone="blue">owner</Badge></td><td /></tr>
            ))}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3"><p className="font-medium text-ink">{r.name || r.id}{r.id === me && <span className="ml-2 text-xs text-muted">(you)</span>}</p><p className="text-xs text-muted">{r.id}</p></td>
                <td className="px-4 py-3">
                  <select className={`${input} h-9 w-32`} value={r.role} disabled={r.id === me} onChange={(e) => setRole(r.id, e.target.value as Role)} aria-label={`Role for ${r.id}`}>
                    <option value="owner">Owner</option><option value="editor">Editor</option><option value="viewer">Viewer</option>
                  </select>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button className="rounded p-1.5 text-muted hover:bg-paper hover:text-ink" title="Send setup / reset email" aria-label="Send setup email" onClick={() => reset(r.id)}><Send className="h-4 w-4" /></button>
                  {r.id !== me && <button className="rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-600" title="Remove admin" aria-label="Remove admin" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(roleInfo) as Role[]).map((r) => <div key={r} className="rounded-lg border border-line bg-white p-4"><dt className="text-sm font-semibold capitalize text-ink">{r}</dt><dd className="mt-1 text-xs leading-relaxed text-muted">{roleInfo[r]}</dd></div>)}
      </dl>
    </div>
  )
}

/* ---------- Settings ---------- */
export function SettingsAdmin() {
  const [s, setS] = useState<SettingsDoc>(seedSettings)
  const [saved, setSaved] = useState("")
  useEffect(() => { if (db) getDoc(doc(db, "settings", "site")).then((d) => d.exists() && setS({ ...seedSettings, ...(d.data() as SettingsDoc) })) }, [])
  async function save(e: React.FormEvent) {
    e.preventDefault()
    try { await setDoc(doc(db!, "settings", "site"), s); setSaved("Saved. The public site updates within about 30 seconds.") } catch (err) { setSaved("Error: " + (err as Error).message) }
  }
  return (
    <form onSubmit={save} className="max-w-xl space-y-5 rounded-lg border border-line bg-white p-6">
      <Label>Contact email<input className={`${input} mt-1.5 h-10`} type="email" required value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} /></Label>
      <Label hint="One line per row">Address<textarea className={`${input} mt-1.5`} rows={4} value={s.address.join("\n")} onChange={(e) => setS({ ...s, address: e.target.value.split("\n") })} /></Label>
      <Label>Google Maps link<input className={`${input} mt-1.5 h-10`} value={s.mapUrl} onChange={(e) => setS({ ...s, mapUrl: e.target.value })} /></Label>
      <div className="flex items-center gap-3"><button className="a-primary" type="submit">Save settings</button>{saved && <span className="text-[13px] text-muted">{saved}</span>}</div>
    </form>
  )
}

/* ---------- Import the current site content into Firestore ---------- */
export async function seedAll() {
  const b = writeBatch(db!)
  seedEvents.forEach((x) => b.set(doc(db!, "events", x.id), x))
  seedMembers.forEach((x) => b.set(doc(db!, "members", x.id), x))
  seedAchievements.forEach((x) => b.set(doc(db!, "achievements", x.id), x))
  seedResources.forEach((x) => b.set(doc(db!, "resources", x.id), x))
  b.set(doc(db!, "settings", "site"), seedSettings)
  await b.commit()
}

/** On first admin sign-in, if the database has no site content, load what the website currently shows. */
export async function autoSeedIfEmpty(): Promise<"seeded" | "has-data" | "error"> {
  try {
    const [e, m, a, r] = await Promise.all(["events", "members", "achievements", "resources"].map((c) => getDocs(collection(db!, c))))
    if (e.empty && m.empty && a.empty) { await seedAll(); return "seeded" }
    if (r.empty) { // existing site from before Resources existed: add only the resources
      const b = writeBatch(db!); seedResources.forEach((x) => b.set(doc(db!, "resources", x.id), x)); await b.commit(); return "seeded"
    }
    return "has-data"
  } catch (err) { console.error("auto-seed", err); return "error" }
}

/* ---------- Dashboard ---------- */
const COLS = ["events", "members", "achievements", "applications", "registrations", "messages"] as const
export function Dashboard({ go }: { go: (s: string) => void }) {
  const [counts, setCounts] = useState<Record<string, number | null>>({})
  const [newApps, setNewApps] = useState(0)
  const [recent, setRecent] = useState<any[]>([])
  const [seeding, setSeeding] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    if (!db) return
    const offs = COLS.map((c) => onSnapshot(collection(db!, c), (s) => {
      setCounts((p) => ({ ...p, [c]: s.size }))
      if (c === "applications") {
        const rows = s.docs.map((d) => ({ ...d.data(), id: d.id })) as any[]
        setNewApps(rows.filter((r) => r.status === "new").length)
        setRecent(rows.sort(byNewest).slice(0, 5))
      }
    }, () => setCounts((p) => ({ ...p, [c]: 0 }))))
    return () => offs.forEach((o) => o())
  }, [])

  const empty = counts.events === 0 && counts.members === 0 && counts.achievements === 0

  async function seed() {
    setSeeding(true)
    try {
      await seedAll(); setMsg("Default content imported.")
    } catch (e) { setMsg("Import failed: " + (e as Error).message) }
    setSeeding(false)
  }

  const cards = [
    { k: "events", label: "Events", sub: "" }, { k: "members", label: "Team members", sub: "" },
    { k: "achievements", label: "Achievements", sub: "" }, { k: "applications", label: "Applications", sub: `${newApps} new` },
    { k: "registrations", label: "Registrations", sub: "" }, { k: "messages", label: "Messages", sub: "" },
  ]
  const actions = [
    { label: "Add an event", to: "events", icon: CalendarDays }, { label: "Add a team member", to: "team", icon: Users },
    { label: "Review applications", to: "applications", icon: FileText }, { label: "View registrations", to: "registrations", icon: BookOpen }, { label: "Read messages", to: "messages", icon: Mail },
  ]
  return (
    <div className="space-y-6">
      {empty && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white p-4">
          <div><p className="text-sm font-medium text-ink">The database is empty</p><p className="text-[13px] text-muted">The website is showing its built-in content. Import it to start editing here.</p></div>
          <div className="flex items-center gap-3">{msg && <span className="text-[13px] text-muted">{msg}</span>}<button className="a-primary" onClick={seed} disabled={seeding}>{seeding ? "Importing…" : "Import content"}</button></div>
        </div>
      )}

      <div className="grid grid-cols-2 divide-x divide-y divide-line overflow-hidden rounded-lg border border-line bg-white sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
        {cards.map((c) => (
          <button key={c.k} onClick={() => go(c.k === "members" ? "team" : c.k)} className="px-5 py-4 text-left transition-colors hover:bg-paper/70">
            <p className="text-[13px] text-muted">{c.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-ink">{counts[c.k] ?? "–"}</p>
            <p className="mt-0.5 h-4 text-[13px] font-medium text-acm">{c.sub}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <section className="rounded-lg border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="text-sm font-semibold text-ink">Recent applications</h2>
            <button className="text-[13px] font-medium text-acm hover:underline" onClick={() => go("applications")}>View all</button>
          </div>
          {recent.length === 0 ? <p className="px-5 py-10 text-center text-[13px] text-muted">No applications yet. They will appear here when students apply on the Join page.</p> : (
            <ul className="divide-y divide-line">{recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0"><p className="truncate text-sm font-medium text-ink">{r.name}</p><p className="truncate text-[13px] text-muted">{r.program} · {r.interest}</p></div>
                <div className="shrink-0 text-right"><Badge tone={tone(appStatus, r.status)}>{r.status}</Badge><p className="mt-0.5 text-[13px] text-muted">{fmtDate(r.createdAt)}</p></div>
              </li>
            ))}</ul>
          )}
        </section>

        <section className="space-y-6">
          <div className="rounded-lg border border-line bg-white">
            <h2 className="border-b border-line px-5 py-3 text-sm font-semibold text-ink">Shortcuts</h2>
            <ul className="p-2">{actions.map((a) => (
              <li key={a.label}><button onClick={() => go(a.to)} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-body hover:bg-paper hover:text-ink"><a.icon className="h-4 w-4 text-muted" />{a.label}</button></li>
            ))}</ul>
          </div>
          <p className="px-1 text-[13px] leading-relaxed text-muted">Changes you save here appear on the public website within about 30 seconds.</p>
        </section>
      </div>
    </div>
  )
}
