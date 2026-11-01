import type { Metadata } from "next"
import { Check } from "lucide-react"
import { PageHeader, Section, SectionHead } from "@/components/bits"
import { benefits, tiers } from "@/lib/static"
import { JoinForm } from "./join-form"

export const metadata: Metadata = {
  title: "Join",
  description: "Apply to join the ACM Student Chapter at IILM University and explore ACM membership benefits.",
  alternates: { canonical: "/join" },
}

export default function Join() {
  return (
    <>
      <PageHeader eyebrow="Join" title="Become a member.">Apply to the chapter, and explore ACM membership for access to global resources.</PageHeader>

      <Section>
        <SectionHead eyebrow="Why join" title="Membership benefits" />
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="border-l-2 border-acm pl-4">
              <h3 className="font-semibold text-ink">{b.title}</h3>
              <p className="mt-1 text-sm leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="paper">
        <SectionHead eyebrow="ACM membership" title="Plans">
          Chapter participation is separate from ACM global membership. Fees are set by ACM and may change; confirm current pricing at acm.org/membership.
        </SectionHead>
        <div className="grid gap-6 md:grid-cols-2">
          {tiers.map((t) => (
            <div key={t.name} className="card p-8">
              <h3 className="font-display text-xl font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm">{t.text}</p>
              <p className="mt-5"><span className="font-display text-4xl font-semibold text-ink">{t.price}</span> <span className="text-sm text-muted">{t.per}</span></p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {t.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-acm" />{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl">
          <SectionHead eyebrow="Apply" title="Chapter application">Applications are received by the chapter team, who will contact you by email.</SectionHead>
          <JoinForm />
        </div>
      </Section>
    </>
  )
}
