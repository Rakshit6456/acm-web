"use client"
import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export function LightboxGallery({ images, title, featureFirst = false }: { images: string[]; title: string; featureFirst?: boolean }) {
  const [i, setI] = useState<number | null>(null)
  const close = useCallback(() => setI(null), [])
  const step = useCallback((d: number) => setI((c) => (c === null ? c : (c + d + images.length) % images.length)), [images.length])

  useEffect(() => {
    if (i === null) return
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1) }
    window.addEventListener("keydown", k)
    document.body.style.overflow = "hidden"
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = "" }
  }, [i, close, step])

  if (!images.length) return null
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((src, n) => (
          <button key={src + n} onClick={() => setI(n)} aria-label={`Open photo ${n + 1} of ${images.length}`}
            className={`group overflow-hidden rounded-lg ${featureFirst && n === 0 ? "col-span-2 row-span-2" : ""}`}>
            <Image src={src} alt={`${title}, photo ${n + 1}`} width={600} height={450} unoptimized loading="lazy"
              className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${featureFirst && n === 0 ? "h-full min-h-48" : "aspect-[4/3]"}`} />
          </button>
        ))}
      </div>

      {i !== null && (
        <div role="dialog" aria-modal="true" aria-label={`${title} photo viewer`} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={close}>
          <button onClick={close} aria-label="Close" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><X className="h-5 w-5" /></button>
          {images.length > 1 && <>
            <button onClick={(e) => { e.stopPropagation(); step(-1) }} aria-label="Previous photo" className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-6"><ChevronLeft className="h-6 w-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); step(1) }} aria-label="Next photo" className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-6"><ChevronRight className="h-6 w-6" /></button>
          </>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[i]} alt={`${title}, photo ${i + 1}`} onClick={(e) => e.stopPropagation()} className="max-h-[85vh] max-w-full rounded-lg object-contain" />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">{i + 1} / {images.length}</p>
        </div>
      )}
    </>
  )
}
