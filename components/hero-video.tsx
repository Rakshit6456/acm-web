"use client"
import { useEffect, useRef } from "react"

/** Background video that only plays while it is on screen, so it never costs scroll performance elsewhere. */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => { e.isIntersecting ? v.play().catch(() => {}) : v.pause() }, { threshold: 0.05 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return (
    <video ref={ref} autoPlay muted loop playsInline preload="auto" poster="/videos/hero-poster.jpg" aria-hidden tabIndex={-1}
      className="pointer-events-none absolute inset-0 -z-20 h-full w-full transform-gpu object-cover motion-reduce:hidden">
      <source src="/videos/hero.mp4" type="video/mp4" />
    </video>
  )
}
