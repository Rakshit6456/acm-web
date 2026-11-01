"use client"
import { useState } from "react"
import { Link2, Linkedin, MessageCircle } from "lucide-react"

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const enc = encodeURIComponent
  const item = "flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink hover:border-acm hover:text-acm"
  return (
    <div className="grid gap-2">
      <a className={item} target="_blank" rel="noreferrer" href={`https://wa.me/?text=${enc(`${title} ${url}`)}`}><MessageCircle className="h-4 w-4" /> WhatsApp</a>
      <a className={item} target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}><Linkedin className="h-4 w-4" /> LinkedIn</a>
      <button className={item} onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {} }}>
        <Link2 className="h-4 w-4" /> {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  )
}
