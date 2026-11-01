export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://acm-studentchapter-iilm.vercel.app").replace(/\/$/, "")
export const siteName = "ACM Student Chapter, IILM University Gurugram"
/** Absolute URL for a path or image. Data URLs are returned as-is (callers should skip them for meta tags). */
export const abs = (p: string) => (p.startsWith("http") || p.startsWith("data:") ? p : siteUrl + (p.startsWith("/") ? p : "/" + p))
export const jsonLd = (o: object) => JSON.stringify(o).replace(/</g, "\\u003c")
