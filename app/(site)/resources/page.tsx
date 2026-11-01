import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { PageHeader, Section } from "@/components/bits"
import { getResources } from "@/lib/content"

export const metadata: Metadata = {
  title: "Resources",
  description: "Curated learning resources for IILM students: ACM Digital Library, free courses, coding practice, and open-source opportunities.",
  alternates: { canonical: "/resources" },
}
export const revalidate = 30

export default async function Resources() {
  const all = await getResources()
  const cats = Array.from(new Set(all.map((r) => r.category)))
  return (
    <>
      <PageHeader eyebrow="Resources" title="Learn, practise, grow.">A hand-picked set of free and ACM resources recommended by the chapter.</PageHeader>
      <Section>
        <div className="space-y-14">
          {cats.map((c) => (
            <div key={c}>
              <h2 className="font-display border-b border-line pb-3 text-2xl font-semibold">{c}</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {all.filter((r) => r.category === c).map((r) => (
                  <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="card group flex items-start justify-between gap-4 p-5 transition-all hover:border-acm hover:shadow-md">
                    <div><h3 className="font-semibold text-ink group-hover:text-acm">{r.title}</h3><p className="mt-1.5 text-sm leading-relaxed">{r.description}</p></div>
                    <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted group-hover:text-acm" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
