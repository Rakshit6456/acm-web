"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowRight, Menu, X } from "lucide-react"
import { nav } from "@/lib/static"

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const path = usePathname()
  const active = (href: string) => path === href || path.startsWith(href + "/")

  useEffect(() => { setOpen(false) }, [path])
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", esc)
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", esc) }
  }, [open])

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="hidden bg-navy text-[11px] tracking-wide text-white/80 md:block">
        <div className="container-x flex h-8 items-center justify-between">
          <span>Student chapter of the Association for Computing Machinery</span>
          <a href="https://www.acm.org" target="_blank" rel="noreferrer" className="hover:text-white">acm.org ↗</a>
        </div>
      </div>
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="ACM IILM home">
          <Image src="/images/acm-logo.png" alt="ACM" width={96} height={54} className="h-9 w-auto" priority />
          <span className="hidden h-7 w-px bg-line sm:block" />
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold text-ink">Student Chapter</span>
            <span className="block text-xs text-muted">IILM University, Gurugram</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}
              className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-acm ${active(n.href) ? "text-acm" : "text-body"}`}>
              {n.name}
              {active(n.href) && <span className="absolute inset-x-3 -bottom-[17px] h-0.5 bg-acm" />}
            </Link>
          ))}
          <Link href="/join" className="btn-primary ml-3">Join the chapter</Link>
        </nav>

        <button className="rounded-md p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

    </header>

    {open && (
      <div className="fixed inset-0 z-[60] md:hidden">
        <div className="absolute inset-0 bg-ink/50 [animation:a-fade_.2s_ease-out]" onClick={() => setOpen(false)} />
        <aside className="absolute inset-y-0 right-0 flex w-[82%] max-w-[320px] flex-col rounded-l-2xl bg-white shadow-2xl [animation:a-slide_.22s_ease-out]" aria-label="Mobile menu">
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <Image src="/images/acm-logo.png" alt="ACM" width={96} height={54} className="h-8 w-auto" />
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-body" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-4 w-4" /></button>
          </div>
          <p className="px-5 pb-2 text-xs text-muted">Student Chapter · IILM University, Gurugram</p>
          <nav className="flex-1 overflow-y-auto px-4 py-2">
            {nav.map((n) => (
              <Link key={n.href} href={n.href}
                className={`relative flex items-center justify-between rounded-lg px-3 py-3 text-[15px] transition-colors ${active(n.href) ? "bg-acm/10 font-medium text-acm" : "text-body active:bg-paper"}`}>
                {active(n.href) && <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-acm" />}
                {n.name}
              </Link>
            ))}
          </nav>
          <div className="border-t border-line p-4">
            <Link href="/join" className="btn-primary w-full justify-center">Join the chapter <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </aside>
      </div>
    )}
    </>
  )
}
