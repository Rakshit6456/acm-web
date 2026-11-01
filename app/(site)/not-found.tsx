import Link from "next/link"
export default function NotFound() {
  return (
    <section className="container-x py-32 text-center">
      <p className="eyebrow">404</p>
      <h1 className="font-display mt-3 text-4xl font-semibold">Page not found</h1>
      <p className="mt-3">The page you are looking for does not exist.</p>
      <Link href="/" className="btn-primary mt-8">Back to home</Link>
    </section>
  )
}
