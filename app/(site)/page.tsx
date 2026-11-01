import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen, Wrench, Network, CalendarDays, MapPin, Clock } from "lucide-react"
import { Section, SectionHead } from "@/components/bits"
import { Avatar } from "@/components/avatar"
import { pillars } from "@/lib/static"
import { getAchievements, getEvents, getMembers } from "@/lib/content"

const pillarIcons = [BookOpen, Wrench, Network]

export default async function Home() {
  const [events, members, achievements] = await Promise.all([getEvents(), getMembers(), getAchievements()])
  const pastEvents = events.filter((e) => e.status === "past")
  const ev = events.filter((e) => e.status === "upcoming").sort((a, b) => a.sortDate.localeCompare(b.sortDate))[0]
  const officers = members.filter((m) => m.group === "officer")
  const faculty = members.filter((m) => m.group === "faculty")
  const stats = [
    { n: `${pastEvents.length}`, l: "Events hosted" },
    { n: `${pastEvents.reduce((a, e) => a + (e.attendees || 0), 0)}+`, l: "Participants reached" },
    { n: `${members.filter((m) => m.group === "officer" || m.group === "lead").length}`, l: "Officers & leads" },
    { n: "2025", l: "Chapter inaugurated" },
  ]
  return (
    <>
      {/* HERO */}
      <section className="relative isolate flex min-h-[560px] items-center overflow-hidden bg-navy text-white md:min-h-[640px]">
        {/* Poster shows while the video loads, and for visitors who prefer reduced motion */}
        <video autoPlay muted loop playsInline preload="auto" poster="/videos/hero-poster.jpg" aria-hidden tabIndex={-1}
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover motion-reduce:hidden">
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <Image src="/videos/hero-poster.jpg" alt="" fill priority sizes="100vw" className="-z-30 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/90 via-navy/65 to-navy/30" />
        <div className="container-x relative py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/85 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-acm" /> Official ACM student chapter · IILM University
            </p>
            <h1 className="font-display mt-6 text-4xl font-semibold leading-[1.08] !text-white sm:text-5xl lg:text-6xl">
              Advancing computing, <span className="text-acm">together.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              The ACM Student Chapter at IILM University, Gurugram is a student-run community for workshops, hackathons, seminars and mentorship, connected to the world&apos;s largest computing society.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/join" className="btn-primary">Join the chapter <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/events" className="btn-ghost-light">View events</Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-line bg-white">
        <div className="container-x grid grid-cols-2 divide-x divide-line md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="px-4 py-8 text-center">
              <p className="font-display text-3xl font-semibold text-ink md:text-4xl">{s.n}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow">Who we are</p>
            <h2 className="font-display mt-2 text-3xl font-semibold md:text-4xl">A bridge between the classroom and the industry.</h2>
            <p className="mt-4 leading-relaxed">
              Founded in 1947, ACM is the world&apos;s largest educational and scientific computing society. Our chapter brings that global community to IILM, helping students build technical depth, leadership and a professional network.
            </p>
            <Link href="/about" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-acm hover:text-acm-dark">About the chapter <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {pillars.map((p, i) => {
              const Icon = pillarIcons[i]
              return (
                <div key={p.title} className="card p-6 transition-shadow hover:shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-acm-soft text-acm"><Icon className="h-5 w-5" /></div>
                  <h3 className="mt-5 font-display text-xl font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed">{p.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* UPCOMING */}
      {ev && (
      <Section tone="paper">
        <SectionHead eyebrow="Recruitment" title="Join the team" action={{ href: "/events", label: "All events" }} />
        <div className="card grid overflow-hidden md:grid-cols-[1fr_1.3fr]">
          <Image src={ev.image} alt={ev.title} width={700} height={500} className="h-full min-h-56 w-full object-cover" />
          <div className="p-8 md:p-10">
            <span className="rounded bg-acm-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-acm">{ev.type}</span>
            <h3 className="font-display mt-4 text-2xl font-semibold">{ev.title}</h3>
            <p className="mt-3 leading-relaxed">{ev.summary}</p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-acm" />{ev.date}</span>
              {ev.time && <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-acm" />{ev.time}</span>}
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-acm" />{ev.venue}</span>
            </div>
            <Link href={`/events/${ev.id}`} className="btn-dark mt-7">View details</Link>
          </div>
        </div>
      </Section>
      )}

      {/* PAST EVENTS */}
      <Section>
        <SectionHead eyebrow="Our work" title="Recent events" action={{ href: "/events", label: "Browse archive" }}>
          Workshops, seminars and contests organised by students, for students.
        </SectionHead>
        <div className="grid gap-6 md:grid-cols-3">
          {pastEvents.slice(0, 3).map((e) => (
            <Link key={e.id} href={`/events/${e.id}`} className="card group overflow-hidden transition-shadow hover:shadow-lg">
              <div className="overflow-hidden"><Image src={e.image} alt={e.title} width={600} height={400} className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-acm">{e.type} · {e.date}</p>
                <h3 className="font-display mt-2 text-lg font-semibold leading-snug">{e.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm">{e.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ACHIEVEMENTS */}
      <Section tone="paper">
        <SectionHead eyebrow="Recognition" title="Achievements" />
        <div className="grid gap-6 md:grid-cols-3">
          {achievements.map((a) => (
            <figure key={a.title} className="relative overflow-hidden rounded-xl">
              <Image src={a.image} alt={a.title} width={600} height={450} className="aspect-[4/3] w-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/95 to-transparent p-5 pt-16 text-white">
                <p className="font-display text-lg font-semibold">{a.title}</p>
                <p className="text-sm text-white/75">{a.note}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* LEADERSHIP */}
      <Section>
        <SectionHead eyebrow="People" title="Leadership" action={{ href: "/team", label: "Meet the full team" }} />
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {[...faculty.slice(0, 1), ...officers.slice(0, 4)].map((m) => (
            <div key={m.name} className="text-center">
              <Avatar src={m.image} name={m.name} className="aspect-square w-full rounded-xl" />
              <p className="mt-3 text-sm font-semibold text-ink">{m.name}</p>
              <p className="text-xs text-muted">{m.role}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="grid-bg relative overflow-hidden bg-navy py-16 text-center text-white">
        <div className="container-x relative">
          <h2 className="font-display mx-auto max-w-2xl text-3xl font-semibold !text-white md:text-4xl">Build the skills. Join the community.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/75">Become part of a chapter that learns by doing. Membership gives access to events, mentors and the ACM Digital Library.</p>
          <div className="mt-8 flex justify-center">
            <Link href="/join" className="btn-primary">Join the chapter</Link>
          </div>
        </div>
      </section>
    </>
  )
}
