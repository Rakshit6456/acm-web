import Link from "next/link"
import Image from "next/image"
import { Mail, MapPin } from "lucide-react"
import { nav } from "@/lib/static"
import { getSettings } from "@/lib/content"

export async function SiteFooter() {
  const site = await getSettings()
  return (
    <footer className="bg-navy text-white/70">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-4">
            <Image src="/images/acm-logo.png" alt="ACM" width={96} height={54} className="h-10 w-auto rounded bg-white px-2 py-1" />
            <Image src="/images/iilm-logo.png" alt="IILM University" width={120} height={46} className="h-10 w-auto rounded bg-white px-2 py-1" />
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            An official student chapter of the Association for Computing Machinery, advancing computing as a science and a profession at IILM University.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {[...nav, { name: "Join", href: "/join" }].map((n) => (
              <li key={n.href}><Link href={n.href} className="hover:text-white">{n.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white">ACM</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="https://www.acm.org" target="_blank" rel="noreferrer" className="hover:text-white">ACM.org</a></li>
            <li><a href="https://dl.acm.org" target="_blank" rel="noreferrer" className="hover:text-white">Digital Library</a></li>
            <li><a href="https://www.acm.org/membership" target="_blank" rel="noreferrer" className="hover:text-white">Membership</a></li>
            <li><a href="https://www.acm.org/code-of-ethics" target="_blank" rel="noreferrer" className="hover:text-white">Code of Ethics</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-acm" />{site.address.slice(0, 3).join(", ")}</li>
            <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-acm" /><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-1 py-5 text-xs sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} ACM Student Chapter, IILM University Gurugram.</span>
        </div>
      </div>
    </footer>
  )
}
