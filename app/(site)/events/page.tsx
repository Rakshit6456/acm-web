import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { CalendarDays, MapPin, Mic2, Users } from "lucide-react"
import { PageHeader, Section, SectionHead } from "@/components/bits"
import { getEvents } from "@/lib/content"

export const metadata: Metadata = {
  title: "Events",
  description: "Workshops, seminars, hackathons and contests organised by the ACM Student Chapter at IILM University, Gurugram.",
  alternates: { canonical: "/events" },
}

export default async function Events() {
  const events = await getEvents()
  const pastEvents = events.filter((e) => e.status === "past")
  const upcoming = events.filter((e) => e.status === "upcoming").sort((a, b) => a.sortDate.localeCompare(b.sortDate))
  return (
    <>
      <PageHeader eyebrow="Events" title="Workshops, seminars and contests.">
        A record of what the chapter has organised, and what is coming next.
      </PageHeader>

      {upcoming.length > 0 && (
      <Section>
        <SectionHead eyebrow="Coming up" title="Upcoming" />
        <div className="space-y-6">
          {upcoming.map((ev) => (
            <div key={ev.id} className="card grid overflow-hidden md:grid-cols-[1fr_1.4fr]">
              {ev.image && <Image src={ev.image} alt={ev.title} width={700} height={500} unoptimized className="h-full min-h-56 w-full object-cover" />}
              <div className="p-8">
                <span className="rounded bg-acm-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-acm">{ev.type}</span>
                <h3 className="font-display mt-3 text-2xl font-semibold">{ev.title}</h3>
                <p className="mt-3 leading-relaxed">{ev.summary}</p>
                <p className="mt-4 flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4 text-acm" />{ev.date}{ev.time ? ` · ${ev.time}` : ""}</p>
                <Link href={`/events/${ev.id}`} className="btn-dark mt-6">Details &amp; registration</Link>
              </div>
            </div>
          ))}
        </div>
      </Section>
      )}

      <Section tone="paper">
        <SectionHead eyebrow="Archive" title="Past events" />
        <div className="space-y-8">
          {pastEvents.map((e, i) => (
            <article id={e.id} key={e.id} className="card scroll-mt-28 overflow-hidden">
              <div className={`grid md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                {e.image && <Image src={e.image} alt={e.title} width={800} height={600} unoptimized className="h-full min-h-64 w-full object-cover" />}
                <div className="p-8 md:p-10">
                  <span className="rounded bg-acm-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-acm">{e.type}</span>
                  <h3 className="font-display mt-4 text-2xl font-semibold">{e.title}</h3>
                  <p className="mt-3 leading-relaxed">{e.summary}</p>
                  <ul className="mt-5 grid gap-2 text-sm">
                    <li className="flex gap-2"><CalendarDays className="h-4 w-4 text-acm" />{e.date}</li>
                    <li className="flex gap-2"><MapPin className="h-4 w-4 text-acm" />{e.venue}</li>
                    {e.speaker && <li className="flex gap-2"><Mic2 className="h-4 w-4 text-acm" />{e.speaker}</li>}
                    {e.attendees > 0 && <li className="flex gap-2"><Users className="h-4 w-4 text-acm" />{e.attendees} participants</li>}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {(e.highlights || []).map((h) => <span key={h} className="rounded-full border border-line px-3 py-1 text-xs">{h}</span>)}
                  </div>
                  <Link href={`/events/${e.id}`} className="btn-outline mt-6">View details &amp; photos</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  )
}
