import { collection, doc, getDoc, getDocs } from "firebase/firestore"
import { db } from "./firebase"
import { seedAchievements, seedEvents, seedMembers, seedResources, seedSettings } from "./seed"
import type { AchievementDoc, EventDoc, MemberDoc, ResourceDoc, SettingsDoc } from "./types"

async function list<T>(name: string, fallback: T[]): Promise<T[]> {
  if (!db) return fallback
  try {
    const snap = await getDocs(collection(db, name))
    if (snap.empty) return fallback
    return snap.docs.map((d) => ({ ...(d.data() as object), id: d.id }) as T)
  } catch (e) {
    console.error(`[content] failed to read ${name}`, e)
    return fallback
  }
}

export async function getEvents(): Promise<EventDoc[]> {
  const all = await list<EventDoc>("events", seedEvents)
  return all.sort((a, b) => b.sortDate.localeCompare(a.sortDate))
}
export async function getMembers(): Promise<MemberDoc[]> {
  const all = await list<MemberDoc>("members", seedMembers)
  return all.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}
export async function getAchievements(): Promise<AchievementDoc[]> {
  const all = await list<AchievementDoc>("achievements", seedAchievements)
  return all.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}
export async function getResources(): Promise<ResourceDoc[]> {
  const all = await list<ResourceDoc>("resources", seedResources)
  return all.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}
export async function getEvent(id: string): Promise<EventDoc | undefined> {
  return (await getEvents()).find((e) => e.id === id)
}
export async function getSettings(): Promise<SettingsDoc> {
  if (!db) return seedSettings
  try {
    const s = await getDoc(doc(db, "settings", "site"))
    return s.exists() ? { ...seedSettings, ...(s.data() as Partial<SettingsDoc>) } : seedSettings
  } catch {
    return seedSettings
  }
}

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
