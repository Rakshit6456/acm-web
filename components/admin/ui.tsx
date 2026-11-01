"use client"
import { useEffect } from "react"
import { X } from "lucide-react"

export const input = "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-ink/10 read-only:bg-paper disabled:bg-paper"

function useLock(onClose: () => void) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", k)
    document.body.style.overflow = "hidden"
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = "" }
  }, [onClose])
}

/** Centered dialog, for short confirmations. */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useLock(onClose)
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/40 p-4" style={{ animation: "a-fade .15s" }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-md rounded-lg border border-line bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-muted hover:bg-paper hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 pb-5 pt-3">{children}</div>
      </div>
    </div>
  )
}

/** Right-hand slide-over, for editing records. */
export function Drawer({ title, subtitle, onClose, children, footer }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  useLock(onClose)
  return (
    <div className="fixed inset-0 z-[80] bg-ink/30" style={{ animation: "a-fade .15s" }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside role="dialog" aria-modal="true" aria-label={title} style={{ animation: "a-slide .2s ease-out" }} className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-line bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-line px-6 py-4">
          <div><h2 className="text-base font-semibold text-ink">{title}</h2>{subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}</div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1.5 text-muted hover:bg-paper hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-line bg-paper/60 px-6 py-3">{footer}</div>}
      </aside>
    </div>
  )
}

export function Label({ children, hint, className = "" }: { children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{children}</span>
      {hint && <span className="-mt-1 mb-1.5 block text-[13px] text-muted">{hint}</span>}
    </div>
  )
}

const dot = { gray: "bg-gray-400", blue: "bg-acm", green: "bg-emerald-500", red: "bg-red-500", amber: "bg-amber-500" }
/** Status shown as a small dot + label (quieter than coloured pills). */
export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: keyof typeof dot }) {
  return <span className="inline-flex items-center gap-1.5 text-[13px] capitalize text-body"><span className={`h-1.5 w-1.5 rounded-full ${dot[tone]}`} />{children}</span>
}

export function fmtDate(ts?: { seconds: number } | null) {
  if (!ts) return "—"
  return new Date(ts.seconds * 1000).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}
