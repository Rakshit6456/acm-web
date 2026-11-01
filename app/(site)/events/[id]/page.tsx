import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, CalendarDays, Clock, MapPin, Mic2, Users } from "lucide-react"
import { PageHeader } from "@/components/bits"
import { LightboxGallery } from "@/components/lightbox-gallery"
import { ShareButtons } from "@/components/share-buttons"
import { getEvents } from "@/lib/content"
import { abs, jsonLd, siteName, siteUrl } from "@/lib/site"
import { RegisterForm } from "./register-form"

export const revalidate = 30

type Props = { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ev = (await getEvents()).find((e) => e.id === params.id)
  if (!ev) return { title: "Event not found" }
  const img = ev.image && !ev.image.startsWith("data:") ? [abs(ev.image)] : undefined
  return {
    title: ev.title,
    description: ev.summary.slice(0, 160),
    alternates: { canonical: `/events/${ev.id}` },
    openGraph: { type: "article", title: ev.title, description: ev.summary.slice(0, 200), url: `/events/${ev.id}`, images: img },
    twitter: { card: "summary_large_image", title: ev.title, description: ev.summary.slice(0, 200), images: img },
  }
}

export default async function EventPage({ params }: Props) {
  const events = await getEvents()
  const ev = events.find((e) => e.id === params.id)
  if (!ev) notFound()

  const upcoming = ev.status === "upcoming"
  const regOpen = upcoming && ev.registration !== "closed"
  const idx = events.findIndex((e) => e.id === ev.id)
  const newer = events[idx - 1], older = events[idx + 1]
  const url = `${siteUrl}/events/${ev.id}`
  const details = [
    { icon: CalendarDays, label: ev.date + (ev.time ? ` · ${ev.time}` : "") },
    { icon: MapPin, label: ev.venue },
    ...(ev.speaker ? [{ icon: Mic2, label: ev.speaker }] : []),
    ...(ev.attendees > 0 ? [{ icon: Users, label: `${ev.attendees} participants` }] : []),
  ]

  const ld = {
    "@context": "https://schema.org", "@type": "Event", name: ev.title, description: ev.summary, startDate: ev.sortDate,
    eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: ev.venue, address: { "@type": "PostalAddress", addressLocality: "Gurugram", addressRegion: "Haryana", addressCountry: "IN" } },
    organizer: { "@type": "Organization", name: siteName, url: siteUrl },
    ...(ev.image && !ev.image.startsWith("data:") ? { image: [abs(ev.image)] } : {}), url,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <PageHeader eyebrow={`${ev.type} · ${upcoming ? "Upcoming" : "Past event"}`} title={ev.title}>
        {ev.date} · {ev.venue}
      </PageHeader>

      <div className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <article>
          <Link href="/events" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-acm hover:text-acm-dark"><ArrowLeft className="h-4 w-4" /> All events</Link>
          {ev.image && <Image src={ev.image} alt={ev.title} width={1200} height={700} unoptimized priority className="aspect-[16/9] w-full rounded-xl border border-line object-cover" />}
          <h2 className="font-display mt-8 text-2xl font-semibold">About this event</h2>
          <p className="mt-3 text-lg leading-relaxed">{ev.summary}</p>

          {(ev.highlights || []).length > 0 && (
            <>
              <h2 className="font-display mt-10 text-2xl font-semibold">Highlights</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {ev.highlights.map((h) => <li key={h} className="flex items-start gap-2 rounded-lg border border-line px-4 py-3 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-acm" />{h}</li>)}
              </ul>
            </>
          )}

          {(ev.gallery || []).length > 0 && (
            <>
              <h2 className="font-display mt-10 text-2xl font-semibold">Photos</h2>
              <div className="mt-4"><LightboxGallery images={ev.gallery} title={ev.title} /></div>
            </>
          )}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink">Event details</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {details.map((d, i) => <li key={i} className="flex gap-2.5"><d.icon className="mt-0.5 h-4 w-4 shrink-0 text-acm" />{d.label}</li>)}
            </ul>
          </div>

          <div className="card p-5">
            {regOpen ? (<><h2 className="mb-3 text-sm font-semibold text-ink">Register</h2><RegisterForm eventId={ev.id} eventTitle={ev.title} /></>) : (
              <>
                <h2 className="text-sm font-semibold text-ink">{upcoming ? "Registration closed" : "This event has ended"}</h2>
                <p className="mt-2 text-sm">{upcoming ? "Registration for this event is not open right now." : "Browse upcoming events or join the chapter to hear about the next one."}</p>
                <Link href={upcoming ? "/contact" : "/events"} className="btn-outline mt-4 w-full">{upcoming ? "Contact us" : "See all events"}</Link>
              </>
            )}
          </div>

          <div className="card p-5"><h2 className="mb-3 text-sm font-semibold text-ink">Share</h2><ShareButtons url={url} title={ev.title} /></div>
        </aside>
      </div>

      {(newer || older) && (
        <nav aria-label="More events" className="border-t border-line bg-paper">
          <div className="container-x grid gap-4 py-8 sm:grid-cols-2">
            {older ? <Link href={`/events/${older.id}`} className="card p-5 hover:border-acm"><p className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted"><ArrowLeft className="h-3.5 w-3.5" /> Earlier</p><p className="font-display mt-1 font-semibold text-ink">{older.title}</p></Link> : <span />}
            {newer && <Link href={`/events/${newer.id}`} className="card p-5 text-right hover:border-acm"><p className="flex items-center justify-end gap-1 text-xs uppercase tracking-wider text-muted">Later <ArrowRight className="h-3.5 w-3.5" /></p><p className="font-display mt-1 font-semibold text-ink">{newer.title}</p></Link>}
          </div>
        </nav>
      )}
    </>
  )
}
