import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { jsonLd, siteName, siteUrl } from "@/lib/site"

export const revalidate = 30

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
        "@context": "https://schema.org", "@type": "Organization", name: siteName, url: siteUrl, logo: `${siteUrl}/images/acm-logo.png`,
        parentOrganization: { "@type": "Organization", name: "Association for Computing Machinery", url: "https://www.acm.org" },
        address: { "@type": "PostalAddress", streetAddress: "Sector 53, Golf Course Road", addressLocality: "Gurugram", addressRegion: "Haryana", postalCode: "122003", addressCountry: "IN" },
      }) }} />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  )
}
