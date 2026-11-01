import { ImageResponse } from "next/og"

export const alt = "ACM Student Chapter, IILM University Gurugram"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#0b2545 0%,#12335f 100%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 56, height: 56, background: "#0085ca", transform: "rotate(45deg)", borderRadius: 8, display: "flex" }} />
          <div style={{ fontSize: 34, fontWeight: 700, marginLeft: 12, letterSpacing: 1 }}>ACM</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>ACM Student Chapter</div>
          <div style={{ fontSize: 40, marginTop: 20, color: "#9fd4f0" }}>IILM University, Gurugram</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "rgba(255,255,255,0.75)" }}>
          <span>Workshops · Hackathons · Seminars</span><span>Advancing computing, together.</span>
        </div>
      </div>
    ),
    size,
  )
}
