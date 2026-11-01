import Image from "next/image"

/** Square person photo. Photos are pre-cropped around the face; falls back to initials. */
export function Avatar({ src, name, className = "" }: { src?: string; name: string; className?: string }) {
  if (!src) {
    const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("")
    return (
      <div className={`flex items-center justify-center bg-acm-soft font-display text-2xl font-semibold text-acm ${className}`} aria-label={name}>{initials}</div>
    )
  }
  return <Image src={src} alt={name} width={400} height={400} unoptimized className={`object-cover object-center ${className}`} />
}
