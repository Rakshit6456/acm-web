export type EventDoc = {
  id: string
  title: string
  status: "upcoming" | "past"
  date: string        // display date, e.g. "16 September 2025"
  sortDate: string    // ISO yyyy-mm-dd, used for ordering
  time?: string
  type: string
  venue: string
  speaker: string
  summary: string
  attendees: number
  highlights: string[]
  image: string
  gallery: string[]
  registration?: "open" | "closed"
}

export type MemberGroup = "faculty" | "officer" | "lead" | "volunteer"
export type MemberDoc = {
  id: string
  name: string
  role: string
  group: MemberGroup
  skills: string[]
  dept?: string
  email?: string
  linkedin?: string
  image: string
  order: number
}

export type AchievementDoc = { id: string; title: string; note: string; image: string; order: number }

export type SettingsDoc = { email: string; address: string[]; mapUrl: string }

export type ApplicationDoc = {
  id: string; name: string; email: string; program: string; year: string; interest: string; why: string
  status: "new" | "reviewing" | "accepted" | "rejected"; createdAt?: { seconds: number } | null
}
export type MessageDoc = {
  id: string; name: string; email: string; subject: string; message: string
  status: "new" | "read" | "replied"; createdAt?: { seconds: number } | null
}

export type ResourceDoc = { id: string; title: string; description: string; url: string; category: string; order: number }

export type RegistrationDoc = {
  id: string; eventId: string; eventTitle: string; name: string; email: string; phone?: string; program: string; year: string
  status: "registered" | "attended" | "cancelled"; createdAt?: { seconds: number } | null
}

export type Role = "owner" | "editor" | "viewer"
export type AdminDoc = { id: string; email: string; name: string; role: Role }
