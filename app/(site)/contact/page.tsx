import type { Metadata } from "next"
import { Mail, MapPin, ExternalLink } from "lucide-react"
import { PageHeader, Section } from "@/components/bits"
import { getSettings } from "@/lib/content"
import { ContactForm } from "./contact-form"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the ACM Student Chapter at IILM University, Gurugram, for events, membership and collaboration.",
  alternates: { canonical: "/contact" },
}

export default async function Contact() {
  const site = await getSettings()
  return (
    <>
      <PageHeader eyebrow="Contact" title="Get in touch.">Questions about events, membership or collaboration? We would be glad to hear from you.</PageHeader>
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <div className="card p-8">
              <Mail className="h-6 w-6 text-acm" />
              <h2 className="font-display mt-4 text-xl font-semibold">Email</h2>
              <a href={`mailto:${site.email}`} className="mt-2 block break-all text-acm hover:text-acm-dark">{site.email}</a>
              <p className="mt-3 text-sm">For general enquiries, sponsorship and speaker invitations.</p>
            </div>
            <div className="card p-8">
              <MapPin className="h-6 w-6 text-acm" />
              <h2 className="font-display mt-4 text-xl font-semibold">Address</h2>
              <address className="mt-2 not-italic leading-relaxed">{site.address.map((l) => <span key={l} className="block">{l}</span>)}</address>
              <a href={site.mapUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-acm hover:text-acm-dark">Open in Maps <ExternalLink className="h-4 w-4" /></a>
            </div>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  )
}
