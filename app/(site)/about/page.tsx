import type { Metadata } from "next"
import Image from "next/image"
import { PageHeader, Section, SectionHead } from "@/components/bits"
import { getMembers } from "@/lib/content"
import { Avatar } from "@/components/avatar"
import { Target, Users, Lightbulb, Globe, Award, BookOpen } from "lucide-react"

export const metadata: Metadata = {
  title: "About",
  description: "About the ACM Student Chapter at IILM University, Gurugram: our mission, activities and faculty mentors.",
  alternates: { canonical: "/about" },
}

const values = [
  { icon: Target, title: "Mission", text: "Bridge academic learning and industry practice through hands-on experience." },
  { icon: Users, title: "Community", text: "An inclusive space for students of every background in computing." },
  { icon: Lightbulb, title: "Innovation", text: "Encourage curiosity, experimentation and research-driven thinking." },
]
const activities = [
  { icon: BookOpen, title: "Technical workshops", text: "Practical sessions on emerging technologies." },
  { icon: Award, title: "Competitions", text: "Hackathons, coding contests and game-dev tournaments." },
  { icon: Users, title: "Industry talks", text: "Sessions with practitioners and academics." },
  { icon: Globe, title: "Global network", text: "Access to ACM's international community and resources." },
]

export default async function About() {
  const faculty = (await getMembers()).filter((m) => m.group === "faculty")
  return (
    <>
      <PageHeader eyebrow="About" title="A student community for computing.">
        Who we are, what we believe, and how we support students at IILM University.
      </PageHeader>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">The Association</p>
            <h2 className="font-display mt-2 text-3xl font-semibold">About ACM</h2>
            <p className="mt-4 leading-relaxed">The Association for Computing Machinery (ACM) is the world&apos;s largest educational and scientific computing society, uniting educators, researchers and professionals to share resources and address the field&apos;s challenges.</p>
            <p className="mt-4 leading-relaxed">Founded in 1947, ACM advances the arts, sciences and applications of information technology, and publishes the ACM Digital Library, home to a vast body of computing research.</p>
            <dl className="mt-8 grid max-w-sm grid-cols-2 gap-6 border-t border-line pt-6">
              <div><dt className="text-xs uppercase tracking-wider text-muted">Founded</dt><dd className="font-display text-3xl font-semibold text-ink">1947</dd></div>
              <div><dt className="text-xs uppercase tracking-wider text-muted">Members</dt><dd className="font-display text-3xl font-semibold text-ink">100,000+</dd></div>
            </dl>
          </div>
          <Image src="/images/campus/iilm-view.jpg" alt="IILM University campus" width={900} height={600} className="aspect-[3/2] w-full rounded-2xl border border-line object-cover" />
        </div>
      </Section>

      <Section tone="paper">
        <SectionHead eyebrow="Our chapter" title="What we stand for">
          The chapter was established to bridge the gap between academic learning and industry practice.
        </SectionHead>
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="card p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-acm-soft text-acm"><v.icon className="h-5 w-5" /></div>
              <h3 className="font-display mt-5 text-xl font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="Programme" title="What we do" />
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
          {activities.map((a) => (
            <div key={a.title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy text-white"><a.icon className="h-5 w-5" /></div>
              <div>
                <h3 className="font-semibold text-ink">{a.title}</h3>
                <p className="mt-1 text-sm leading-relaxed">{a.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="paper">
        <SectionHead eyebrow="Guidance" title="Faculty mentorship">
          The chapter operates under the guidance of faculty from the Department of Computer Science &amp; Engineering.
        </SectionHead>
        <div className="grid gap-5 md:grid-cols-2">
          {faculty.map((f) => (
            <div key={f.name} className="card flex items-center gap-5 p-5">
              <Avatar src={f.image} name={f.name} className="h-24 w-24 shrink-0 rounded-lg" />
              <div>
                <h3 className="font-display text-lg font-semibold">{f.name}</h3>
                <p className="text-sm font-medium text-acm">{f.role}</p>
                <p className="text-sm text-muted">{f.dept}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
