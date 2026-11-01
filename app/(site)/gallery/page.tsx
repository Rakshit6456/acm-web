import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader, Section } from "@/components/bits"
import { LightboxGallery } from "@/components/lightbox-gallery"
import { getEvents } from "@/lib/content"

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs from ACM Student Chapter workshops, seminars and tournaments at IILM University, Gurugram.",
  alternates: { canonical: "/gallery" },
}

export default async function Gallery() {
  const pastEvents = (await getEvents()).filter((e) => e.status === "past" && (e.gallery || []).length > 0)
  return (
    <>
      <PageHeader eyebrow="Gallery" title="Moments from our events.">Photographs from workshops, seminars and tournaments. Click any photo to enlarge.</PageHeader>
      <Section>
        <div className="space-y-14">
          {pastEvents.map((e) => (
            <div key={e.id}>
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                <h2 className="font-display text-2xl font-semibold"><Link href={`/events/${e.id}`} className="hover:text-acm">{e.title}</Link></h2>
                <p className="text-sm text-muted">{e.date}</p>
              </div>
              <LightboxGallery images={e.gallery} title={e.title} />
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
