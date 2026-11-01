"use client"
import { useState } from "react"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { field } from "../../join/join-form"

export function RegisterForm({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "dup" | "error">("idle")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>
    if (d.website) return
    if (!db) return setState("error")
    setState("sending")
    const email = d.email.trim()
    // One registration per email per event: the document id is deterministic and rules only allow create.
    const id = `${eventId}__${email.toLowerCase().replace(/[^a-z0-9@.+_-]/g, "_")}`
    try {
      await setDoc(doc(db, "registrations", id), {
        eventId, eventTitle, name: d.name.trim(), email, phone: (d.phone || "").trim(), program: d.program.trim(), year: d.year,
        status: "registered", createdAt: serverTimestamp(),
      })
      form.reset(); setState("done")
    } catch (err) {
      console.error(err)
      setState((err as { code?: string }).code === "permission-denied" ? "dup" : "error")
    }
  }

  if (state === "done") return (
    <div className="rounded-lg bg-acm-soft p-4 text-sm"><p className="font-semibold text-ink">You are registered.</p><p className="mt-1">We have saved your details. The chapter team will contact you by email with any updates.</p></div>
  )
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="block text-sm font-medium text-ink">Full name<input required maxLength={100} name="name" className={`${field} mt-1`} /></label>
      <label className="block text-sm font-medium text-ink">Email<input required type="email" maxLength={120} name="email" className={`${field} mt-1`} placeholder="name@iilm.edu" /></label>
      <label className="block text-sm font-medium text-ink">Phone <span className="font-normal text-muted">(optional)</span><input name="phone" type="tel" maxLength={20} className={`${field} mt-1`} /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium text-ink">Programme<input required maxLength={100} name="program" className={`${field} mt-1`} placeholder="B.Tech CSE" /></label>
        <label className="block text-sm font-medium text-ink">Year
          <select required name="year" defaultValue="" className={`${field} mt-1`}><option value="" disabled>Select</option><option>First</option><option>Second</option><option>Third</option><option>Fourth</option></select>
        </label>
      </div>
      <button type="submit" disabled={state === "sending"} className="btn-primary w-full disabled:opacity-60">{state === "sending" ? "Registering…" : "Register for this event"}</button>
      {state === "dup" && <p role="alert" className="text-sm text-amber-700">This email may already be registered for this event. If not, please contact the chapter.</p>}
      {state === "error" && <p role="alert" className="text-sm text-red-600">Could not register right now. Please try again shortly.</p>}
    </form>
  )
}
