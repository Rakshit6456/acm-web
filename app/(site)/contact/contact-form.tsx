"use client"
import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { field } from "../join/join-form"

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle")
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>
    if (d.website) return
    if (!db) { setState("error"); return }
    setState("sending")
    try {
      await addDoc(collection(db, "messages"), { name: d.name.trim(), email: d.email.trim(), subject: d.subject.trim(), message: d.message.trim(), status: "new", createdAt: serverTimestamp() })
      form.reset(); setState("done")
    } catch (err) { console.error(err); setState("error") }
  }
  if (state === "done") return <div className="card p-8 text-center"><h3 className="font-display text-xl font-semibold">Message sent</h3><p className="mt-2 text-sm">Thanks for reaching out. We will reply by email.</p></div>
  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6 md:p-8">
      <h2 className="font-display text-xl font-semibold">Send a message</h2>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink">Name<input required maxLength={100} name="name" className={`${field} mt-1.5`} /></label>
        <label className="text-sm font-medium text-ink">Email<input required type="email" maxLength={120} name="email" className={`${field} mt-1.5`} /></label>
      </div>
      <label className="block text-sm font-medium text-ink">Subject<input required maxLength={150} name="subject" className={`${field} mt-1.5`} /></label>
      <label className="block text-sm font-medium text-ink">Message<textarea required maxLength={2000} name="message" rows={5} className={`${field} mt-1.5`} /></label>
      <button type="submit" disabled={state === "sending"} className="btn-primary w-full disabled:opacity-60">{state === "sending" ? "Sending…" : "Send message"}</button>
      {state === "error" && <p role="alert" className="text-center text-sm text-red-600">Could not send. Please email us directly.</p>}
    </form>
  )
}
