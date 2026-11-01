import type { MetadataRoute } from "next"
import { getEvents } from "@/lib/content"
import { siteUrl } from "@/lib/site"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/about", "/events", "/team", "/resources", "/gallery", "/join", "/contact"]
  const events = await getEvents()
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p}`, changeFrequency: (p === "" || p === "/events" ? "weekly" : "monthly") as "weekly" | "monthly", priority: p === "" ? 1 : p === "/events" ? 0.9 : 0.7 })),
    ...events.map((e) => ({ url: `${siteUrl}/events/${e.id}`, lastModified: e.sortDate ? new Date(e.sortDate) : undefined, changeFrequency: "monthly" as const, priority: 0.6 })),
  ]
}
