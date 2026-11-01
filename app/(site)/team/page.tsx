import type { Metadata } from "next"
import { Linkedin, Mail } from "lucide-react"
import { PageHeader, Section, SectionHead } from "@/components/bits"
import { getMembers } from "@/lib/content"
import type { MemberDoc } from "@/lib/types"
import { Avatar } from "@/components/avatar"

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the faculty mentors, office bearers and department heads of the ACM Student Chapter at IILM University.",
  alternates: { canonical: "/team" },
}

function MemberCard({ m }: { m: MemberDoc }) {
  return (
    <div className="card overflow-hidden transition-shadow hover:shadow-lg">
      <Avatar src={m.image} name={m.name} className="aspect-square w-full" />
      <div className="p-4">
        <h3 className="font-semibold text-ink">{m.name}</h3>
        <p className="text-sm font-medium text-acm">{m.role}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs text-muted">{(m.skills || []).join(" · ")}</p>
          {m.linkedin && <a href={m.linkedin} target="_blank" rel="noreferrer" aria-label={`${m.name} on LinkedIn`} className="text-muted hover:text-acm"><Linkedin className="h-4 w-4" /></a>}
        </div>
      </div>
    </div>
  )
}

export default async function Team() {
  const all = await getMembers()
  const by = (g: string) => all.filter((m) => m.group === g)
  const faculty = by("faculty"), officers = by("officer"), leads = by("lead"), volunteers = by("volunteer")
  return (
    <>
      <PageHeader eyebrow="Team" title="The people behind the chapter.">Faculty mentors and student leaders who plan, build and run every event.</PageHeader>

      <Section>
        <SectionHead eyebrow="Mentors" title="Faculty" />
        <div className="grid gap-5 md:grid-cols-2">
          {faculty.map((f) => (
            <div key={f.name} className="card flex gap-5 p-5">
              <Avatar src={f.image} name={f.name} className="h-32 w-32 shrink-0 rounded-lg" />
              <div>
                <h3 className="font-display text-xl font-semibold">{f.name}</h3>
                <p className="text-sm font-medium text-acm">{f.role}</p>
                <p className="text-sm text-muted">{f.dept}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{(f.skills || []).map((a) => <span key={a} className="rounded-full bg-paper px-2.5 py-0.5 text-xs">{a}</span>)}</div>
                {f.email && <a href={`mailto:${f.email}`} className="mt-3 inline-flex items-center gap-1.5 text-sm text-acm hover:text-acm-dark"><Mail className="h-4 w-4" />{f.email}</a>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="paper">
        <SectionHead eyebrow="Executive committee" title="Office bearers" />
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">{officers.map((m) => <MemberCard key={m.name} m={m} />)}</div>
      </Section>

      <Section>
        <SectionHead eyebrow="Leads" title="Department heads" />
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">{leads.map((m) => <MemberCard key={m.name} m={m} />)}</div>
      </Section>

      <Section tone="paper">
        <SectionHead eyebrow="Volunteers" title="Core volunteers" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {volunteers.map((v) => (
            <div key={v.name} className="card flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-acm-soft font-semibold text-acm">{v.name[0]}</span>
              <div><p className="text-sm font-semibold text-ink">{v.name}</p><p className="text-xs text-muted">{v.role}</p></div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
