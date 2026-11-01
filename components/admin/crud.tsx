"use client"
import { useEffect, useMemo, useState } from "react"
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore"
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { useAuth } from "./auth"
import { slugify } from "@/lib/content"
import { ImageField, ImagesField } from "./image-field"
import { Drawer, Modal, Label, input, Badge } from "./ui"

/* eslint-disable @typescript-eslint/no-explicit-any */
export type FieldDef = {
  key: string; label: string
  type: "text" | "textarea" | "number" | "select" | "list" | "lines" | "image" | "avatar" | "images" | "date" | "email"
  options?: { value: string; label: string }[]; required?: boolean; hint?: string; full?: boolean; placeholder?: string
}
export type Column = { key: string; label: string; render?: (row: any) => React.ReactNode }

type Props = {
  col: string; singular: string; plural: string
  fields: FieldDef[]; columns: Column[]; defaults: Record<string, any>
  idFrom?: string; sort?: (a: any, b: any) => number
  transform?: (d: any) => any
  /** Inbox mode: records come from the public site; admin can view, set status and delete only. */
  inbox?: { statusOptions: { value: string; label: string; tone: "gray" | "blue" | "green" | "red" | "amber" }[] }
  csv?: boolean
}

const toForm = (f: FieldDef, v: any) => (f.type === "list" ? (v || []).join(", ") : f.type === "lines" ? (v || []).join("\n") : v ?? (f.type === "images" ? [] : ""))
const fromForm = (f: FieldDef, v: any) =>
  f.type === "list" ? String(v).split(",").map((s) => s.trim()).filter(Boolean)
  : f.type === "lines" ? String(v).split("\n").map((s) => s.trim()).filter(Boolean)
  : f.type === "number" ? Number(v) || 0 : v

export function CrudManager(p: Props) {
  const { canEdit } = useAuth()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [editing, setEditing] = useState<any | null>(null) // existing row, or {__new:true}
  const [deleting, setDeleting] = useState<any | null>(null)
  const [toast, setToast] = useState("")

  useEffect(() => {
    if (!db) return
    return onSnapshot(collection(db, p.col), (s) => {
      const r = s.docs.map((d) => ({ ...d.data(), id: d.id }))
      if (p.sort) r.sort(p.sort)
      setRows(r); setLoading(false)
    }, (e) => { console.error(e); setLoading(false); flash("Could not load data: " + e.message) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.col])

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3500) }
  const shown = useMemo(() => rows.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase())), [rows, q])

  async function remove(row: any) {
    try { await deleteDoc(doc(db!, p.col, row.id)); flash(`${p.singular} deleted`) } catch (e) { flash("Delete failed: " + (e as Error).message) }
    setDeleting(null); setEditing(null)
  }

  function exportCsv() {
    const keys = [...p.fields.map((f) => f.key), "createdAt"]
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`
    const lines = [keys.join(","), ...shown.map((r) => keys.map((k) => esc(k === "createdAt" ? (r.createdAt ? new Date(r.createdAt.seconds * 1000).toISOString() : "") : r[k])).join(","))]
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }))
    a.download = `${p.col}-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className={`${input} h-10 pl-9`} placeholder={`Search ${p.plural.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <span className="text-[13px] text-muted">{shown.length} {shown.length === 1 ? p.singular.toLowerCase() : p.plural.toLowerCase()}</span>
        <div className="ml-auto flex gap-2">
          {p.csv && <button className="a-outline" onClick={exportCsv} disabled={!rows.length}><Download className="h-4 w-4" /> Export CSV</button>}
          {!p.inbox && canEdit && <button className="a-primary" onClick={() => setEditing({ __new: true })}><Plus className="h-4 w-4" /> Add {p.singular.toLowerCase()}</button>}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper/70 text-[13px] font-medium uppercase tracking-wide text-muted">
            <tr>{p.columns.map((c) => <th key={c.key} className="px-4 py-2.5 font-medium">{c.label}</th>)}<th className="w-24 px-4 py-2.5"><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <tr><td colSpan={p.columns.length + 1} className="px-4 py-12 text-center text-muted">Loading…</td></tr>}
            {!loading && shown.length === 0 && <tr><td colSpan={p.columns.length + 1} className="px-4 py-14 text-center"><p className="font-medium text-ink">{rows.length ? "No matches" : `No ${p.plural.toLowerCase()} yet`}</p><p className="mt-1 text-[13px] text-muted">{rows.length ? "Try a different search." : p.inbox ? "They will appear here when visitors submit the form." : `Use "Add ${p.singular.toLowerCase()}" to create the first one.`}</p></td></tr>}
            {shown.map((r) => (
              <tr key={r.id} className="group cursor-pointer hover:bg-paper/70" onClick={() => setEditing(r)}>
                {p.columns.map((c) => <td key={c.key} className="max-w-xs px-4 py-2.5 align-middle">{c.render ? c.render(r) : <span className="line-clamp-2">{String(r[c.key] ?? "")}</span>}</td>)}
                <td className="whitespace-nowrap px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <span className="inline-flex gap-0.5 transition-opacity focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    <button className="rounded p-1.5 text-muted hover:bg-line/60 hover:text-ink" aria-label={canEdit ? "Edit" : "View"} onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></button>
                    {canEdit && <button className="rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Delete" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></button>}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <RecordModal p={p} row={editing} onClose={() => setEditing(null)} onSaved={(m) => { flash(m); setEditing(null) }} onDelete={() => setDeleting(editing)} viewOnly={!canEdit} existingIds={rows.map((r) => r.id)} />}
      {deleting && (
        <Modal title={`Delete ${p.singular.toLowerCase()}?`} onClose={() => setDeleting(null)}>
          <p className="text-sm leading-relaxed">This permanently removes <strong className="text-ink">{deleting.title || deleting.name || deleting.subject || deleting.id}</strong>. This cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button className="a-outline" onClick={() => setDeleting(null)}>Cancel</button>
            <button className="a-danger" onClick={() => remove(deleting)}>Delete</button>
          </div>
        </Modal>
      )}
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[90] rounded-md bg-ink px-4 py-2.5 text-sm text-white shadow-xl">{toast}</div>}
    </div>
  )
}

function RecordModal({ p, row, onClose, onSaved, onDelete, existingIds, viewOnly }: { p: Props; row: any; onClose: () => void; onSaved: (m: string) => void; onDelete: () => void; existingIds: string[]; viewOnly: boolean }) {
  const isNew = !!row.__new
  const [form, setForm] = useState<Record<string, any>>(() => {
    const base = isNew ? p.defaults : row
    return Object.fromEntries(p.fields.map((f) => [f.key, toForm(f, base[f.key] ?? p.defaults[f.key])]))
  })
  const [status, setStatus] = useState<string>(row.status || "")
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")
  const set = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }))

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr("")
    if (!db) return
    setSaving(true)
    try {
      if (p.inbox) {
        await updateDoc(doc(db, p.col, row.id), { status })
        return onSaved("Status updated")
      }
      let data: any = Object.fromEntries(p.fields.map((f) => [f.key, fromForm(f, form[f.key])]))
      if (p.transform) data = p.transform(data)
      data = JSON.parse(JSON.stringify(data)) // drop undefined
      if (JSON.stringify(data).length > 900_000) throw new Error("This record is too large (images). Remove or shrink some images.")
      if (isNew) {
        let id = slugify(String(data[p.idFrom || "title"] || "")) || "item"
        if (existingIds.includes(id)) id += "-" + Math.random().toString(36).slice(2, 6)
        await setDoc(doc(db, p.col, id), data)
        onSaved(`${p.singular} added`)
      } else {
        await setDoc(doc(db, p.col, row.id), data, { merge: true })
        onSaved(`${p.singular} updated`)
      }
    } catch (e) { setErr((e as Error).message); setSaving(false) }
  }

  const renderField = (f: FieldDef) => {
    const v = form[f.key]
    switch (f.type) {
      case "textarea": case "lines": return <textarea className={input} rows={f.type === "lines" ? 4 : 3} value={v} onChange={(e) => set(f.key, e.target.value)} required={f.required} readOnly={!!p.inbox} placeholder={f.placeholder} />
      case "select": return <select className={input} value={v} onChange={(e) => set(f.key, e.target.value)} required={f.required}>{f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      case "image": return <ImageField value={v} onChange={(x) => set(f.key, x)} />
      case "avatar": return <ImageField square value={v} onChange={(x) => set(f.key, x)} />
      case "images": return <ImagesField value={v} onChange={(x) => set(f.key, x)} />
      default: return <input className={input} type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "email" ? "email" : "text"} min={f.type === "number" ? 0 : undefined} value={v} onChange={(e) => set(f.key, e.target.value)} required={f.required} readOnly={!!p.inbox} placeholder={f.placeholder} />
    }
  }

  return (
    <Drawer title={p.inbox || viewOnly ? `${p.singular} details` : `${isNew ? "Add" : "Edit"} ${p.singular.toLowerCase()}`} subtitle={!isNew ? (row.title || row.name || row.subject) : undefined} onClose={onClose}
      footer={viewOnly ? (
        <div className="flex items-center justify-between"><span className="text-xs text-muted">Read-only access</span><button type="button" className="a-outline" onClick={onClose}>Close</button></div>
      ) : (
        <div className="flex items-center justify-between">
          {!isNew ? <button type="button" onClick={onDelete} className="text-sm font-medium text-red-600 hover:underline">Delete</button> : <span />}
          <div className="flex gap-2">
            <button type="button" className="a-outline" onClick={onClose}>Cancel</button>
            <button type="submit" form="record-form" className="a-primary" disabled={saving}>{saving ? "Saving…" : p.inbox ? "Update status" : "Save"}</button>
          </div>
        </div>
      )}>
      <form id="record-form" onSubmit={save} className="space-y-5">
        {p.inbox && (
          <div className="rounded-lg border border-line bg-paper/60 p-3">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">{p.inbox.statusOptions.map((o) => (
              <button type="button" key={o.value} disabled={viewOnly} onClick={() => setStatus(o.value)} className={`rounded-md border px-3 py-1 text-[13px] font-medium ${status === o.value ? "border-ink bg-ink text-white" : "border-line bg-white hover:bg-paper"}`}>{o.label}</button>
            ))}</div>
          </div>
        )}
        <fieldset disabled={viewOnly} className="contents">
        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
          {p.fields.map((f) => (
            <Label key={f.key} hint={f.hint} className={f.full || ["textarea", "lines", "images", "image", "avatar"].includes(f.type) ? "sm:col-span-2" : ""}>
              {f.label}{f.required && !p.inbox && <span className="text-red-500"> *</span>}
              {renderField(f)}
            </Label>
          ))}
        </div>
        </fieldset>
        {err && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
      </form>
    </Drawer>
  )
}

export { Badge }
