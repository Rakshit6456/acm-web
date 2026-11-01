// Creates the admin login in Firebase Authentication.
// Usage: node scripts/create-admin.mjs <email> <password>
// Reads NEXT_PUBLIC_FIREBASE_API_KEY from .env.local. The password is never stored in the repo.
import { readFileSync } from "node:fs"

const [email, password] = process.argv.slice(2)
if (!email || !password) { console.error("Usage: node scripts/create-admin.mjs <email> <password>"); process.exit(1) }

let key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
if (!key) {
  try { key = readFileSync(new URL("../.env.local", import.meta.url), "utf8").match(/^NEXT_PUBLIC_FIREBASE_API_KEY=(.+)$/m)?.[1]?.trim() } catch {}
}
if (!key) { console.error("Missing NEXT_PUBLIC_FIREBASE_API_KEY (.env.local)"); process.exit(1) }

const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${key}`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, returnSecureToken: false }),
})
const body = await res.json()
if (res.ok) console.log(`Created admin user ${email}`)
else {
  const m = body?.error?.message
  console.error("Failed:", m)
  if (m === "EMAIL_EXISTS") console.error("That user already exists, so you can sign in with it.")
  if (m === "OPERATION_NOT_ALLOWED") console.error("Enable Email/Password in Firebase Console > Authentication > Sign-in method.")
  process.exit(1)
}
