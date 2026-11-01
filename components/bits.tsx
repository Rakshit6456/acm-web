import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="grid-bg relative overflow-hidden bg-navy text-white">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(0,133,202,.28),transparent)]" />
      <div className="container-x relative py-16 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-acm">{eyebrow}</p>
        <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold !text-white md:text-5xl">{title}</h1>
        {children && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/75">{children}</p>}
      </div>
    </section>
  )
}

export function SectionHead({ eyebrow, title, children, action }: { eyebrow?: string; title: string; children?: React.ReactNode; action?: { href: string; label: string } }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="font-display mt-2 text-3xl font-semibold md:text-4xl">{title}</h2>
        {children && <p className="mt-3 text-base leading-relaxed">{children}</p>}
      </div>
      {action && (
        <Link href={action.href} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-acm hover:text-acm-dark">
          {action.label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}

export function Section({ children, tone = "white", className = "" }: { children: React.ReactNode; tone?: "white" | "paper"; className?: string }) {
  return (
    <section className={`${tone === "paper" ? "bg-paper" : "bg-white"} py-16 md:py-20 ${className}`}>
      <div className="container-x">{children}</div>
    </section>
  )
}
