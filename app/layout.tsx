import type { Metadata, Viewport } from "next"
import { Inter, Source_Serif_4 } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { siteName, siteUrl } from "@/lib/site"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", weight: ["400", "600", "700"] })

const description = "The ACM Student Chapter at IILM University, Gurugram: workshops, hackathons, seminars and a community for students who love computing."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: "%s | ACM IILM" },
  description,
  applicationName: "ACM Student Chapter IILM",
  keywords: ["ACM", "ACM student chapter", "IILM University", "Gurugram", "computer science", "hackathon", "workshops", "robotics", "cybersecurity"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "en_IN", siteName, title: siteName, description, url: "/" },
  twitter: { card: "summary_large_image", title: siteName, description },
  robots: { index: true, follow: true },
  icons: { icon: "/images/acm-logo.png", apple: "/images/acm-logo.png" },
}
export const viewport: Viewport = { themeColor: "#0b2545", width: "device-width", initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
