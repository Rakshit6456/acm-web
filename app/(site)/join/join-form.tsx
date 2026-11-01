"use client"
import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export const field = "w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-acm focus:outline-none focus:ring-2 focus:ring-acm/20"

export function JoinForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle")
  const [err, setErr] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>
    if (d.website) return // honeypot
    if (!db) { setState("error"); setErr("The application service is not configured yet. Please email the chapter directly."); return }
    setState("sending")
    try {
      await addDoc(collection(db, "applications"), {
        name: d.name.trim(), email: d.email.trim(), program: d.program.trim(), year: d.year,
        interest: d.interest, why: d.why.trim(), status: "new", createdAt: serverTimestamp(),
      })
      form.reset()
      setState("done")
    } catch (e) {
      console.error(e)
      setState("error"); setErr("Could not submit your application. Please try again in a moment.")
    }
  }

  if (state === "done") {
    return (
      <div className="card p-8 text-center">
        <h3 className="font-display text-2xl font-semibold">Application received</h3>
        <p className="mt-2">Thank you for applying. The chapter team will get back to you by email.</p>
        <button className="btn-outline mt-6" onClick={() => setState("idle")}>Submit another</button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 md:p-8">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink">Full name<input required maxLength={100} name="name" className={`${field} mt-1.5`} placeholder="Your name" /></label>
        <label className="text-sm font-medium text-ink">University email<input required maxLength={120} type="email" name="email" className={`${field} mt-1.5`} placeholder="name@iilm.edu" /></label>
        <label className="text-sm font-medium text-ink">Programme<input required maxLength={100} name="program" className={`${field} mt-1.5`} placeholder="B.Tech CSE" /></label>
        <label className="text-sm font-medium text-ink">Year
          <select required name="year" className={`${field} mt-1.5`} defaultValue="">
            <option value="" disabled>Select</option><option>First</option><option>Second</option><option>Third</option><option>Fourth</option>
          </select>
        </label>
      </div>
      <label className="block text-sm font-medium text-ink">Area of interest
        <select required name="interest" className={`${field} mt-1.5`} defaultValue="">
          <option value="" disabled>Select</option><option>AI &amp; Data Science</option><option>Web &amp; Software</option><option>Cybersecurity</option><option>Robotics</option><option>Game Development</option><option>Design &amp; Media</option><option>Events &amp; Operations</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-ink">Why do you want to join?<textarea required maxLength={1500} name="why" rows={4} className={`${field} mt-1.5`} /></label>
      <button type="submit" disabled={state === "sending"} className="btn-primary w-full disabled:opacity-60">{state === "sending" ? "Submitting…" : "Submit application"}</button>
      {state === "error" && <p role="alert" className="text-center text-sm text-red-600">{err}</p>}
    </form>
  )
}
