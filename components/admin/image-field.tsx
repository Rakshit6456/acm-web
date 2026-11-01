"use client"
import { useEffect, useRef, useState } from "react"
import { Plus, Trash2, Upload } from "lucide-react"
import { Drawer, input } from "./ui"

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => res(img)
    img.onerror = () => rej(new Error("Could not read image"))
    img.src = url
  })
}

/** Resize keeping aspect ratio; returns a compact JPEG data URL (stored in Firestore). */
export async function resizeToDataUrl(file: File, maxDim = 900, quality = 0.8) {
  const img = await loadImage(file)
  const k = Math.min(1, maxDim / Math.max(img.width, img.height))
  const c = document.createElement("canvas")
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL("image/jpeg", quality)
}

/** Lets the admin frame a face: zoom + position inside a square, so faces are never cut off. */
function SquareCropper({ file, onDone, onCancel }: { file: File; onDone: (d: string) => void; onCancel: () => void }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [px, setPx] = useState(50)
  const [py, setPy] = useState(30)
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => { loadImage(file).then(setImg) }, [file])

  const draw = (size: number, c: HTMLCanvasElement) => {
    if (!img) return
    const side = Math.min(img.width, img.height) / zoom
    const sx = (img.width - side) * (px / 100), sy = (img.height - side) * (py / 100)
    c.width = c.height = size
    c.getContext("2d")!.drawImage(img, sx, sy, side, side, 0, 0, size, size)
  }
  useEffect(() => { if (ref.current) draw(320, ref.current) })

  return (
    <Drawer title="Frame the photo" subtitle="Centre the face so it is never cut off" onClose={onCancel}>
      <div className="grid gap-5">
        <canvas ref={ref} className="aspect-square w-full max-w-sm rounded-lg border border-line bg-paper" />
        <div className="space-y-4 text-sm">
          
          {[["Zoom", zoom, setZoom, 1, 3, 0.05], ["Left ↔ Right", px, setPx, 0, 100, 1], ["Up ↕ Down", py, setPy, 0, 100, 1]].map(([l, v, set, min, max, step]) => (
            <label key={l as string} className="block font-medium text-ink">{l as string}
              <input type="range" min={min as number} max={max as number} step={step as number} value={v as number} onChange={(e) => (set as (n: number) => void)(+e.target.value)} className="mt-1 w-full accent-[#0085ca]" />
            </label>
          ))}
          <div className="flex gap-2 pt-2">
            <button type="button" className="a-primary" onClick={() => { const c = document.createElement("canvas"); draw(600, c); onDone(c.toDataURL("image/jpeg", 0.85)) }}>Use photo</button>
            <button type="button" className="a-outline" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </Drawer>
  )
}

export function ImageField({ value, onChange, square }: { value: string; onChange: (v: string) => void; square?: boolean }) {
  const [crop, setCrop] = useState<File | null>(null)
  const [err, setErr] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  async function pick(f?: File) {
    if (!f) return
    setErr("")
    if (!f.type.startsWith("image/")) return setErr("Please choose an image file.")
    if (square) return setCrop(f)
    try { onChange(await resizeToDataUrl(f)) } catch (e) { setErr((e as Error).message) }
  }

  return (
    <div>
      <div className="flex items-start gap-3">
        <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-paper ${square ? "h-24 w-24" : "h-24 w-36"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span className="text-[13px] text-muted">No image</span>}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input className={input} placeholder="Image URL or /images/… path" value={value.startsWith("data:") ? "" : value} onChange={(e) => onChange(e.target.value)} />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="a-outline !h-9 !px-2.5 text-[13px]" onClick={() => fileRef.current?.click()}><Upload className="h-3.5 w-3.5" /> Upload</button>
            {value && <button type="button" className="text-[13px] text-red-600 hover:underline" onClick={() => onChange("")}>Remove</button>}
            {value.startsWith("data:") && <span className="text-[13px] text-muted">Uploaded ({Math.round(value.length / 1024)} KB)</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = "" }} />
        </div>
      </div>
      {err && <p className="mt-1 text-[13px] text-red-600">{err}</p>}
      {crop && <SquareCropper file={crop} onCancel={() => setCrop(null)} onDone={(d) => { onChange(d); setCrop(null) }} />}
    </div>
  )
}

export function ImagesField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [url, setUrl] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  async function add(files: FileList | null) {
    if (!files) return
    const out: string[] = []
    for (const f of Array.from(files)) if (f.type.startsWith("image/")) out.push(await resizeToDataUrl(f, 800, 0.72))
    onChange([...value, ...out])
  }
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {value.map((src, i) => (
          <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-md border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded bg-white/90 p-1 text-red-600 opacity-0 shadow group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input className={input} placeholder="Paste image URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button type="button" className="a-outline !h-10 !px-2.5 text-[13px]" onClick={() => { if (url.trim()) { onChange([...value, url.trim()]); setUrl("") } }}><Plus className="h-3.5 w-3.5" /> Add</button>
        <button type="button" className="a-outline !h-10 !px-2.5 text-[13px]" onClick={() => fileRef.current?.click()}><Upload className="h-3.5 w-3.5" /> Upload</button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = "" }} />
      </div>
      <p className="mt-1.5 text-[13px] text-muted">Uploaded photos are compressed and stored with the event (keep to about 6 or fewer).</p>
    </div>
  )
}
