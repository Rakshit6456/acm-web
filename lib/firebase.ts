import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const firebaseConfigured = Boolean(config.apiKey && config.projectId)

export const app: FirebaseApp | null = firebaseConfigured ? (getApps().length ? getApp() : initializeApp(config)) : null

export const db = app ? getFirestore(app) : null
export const auth = app ? getAuth(app) : null

/** Emails allowed into the admin portal (UI check only; real enforcement is in firestore.rules). */
export const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "rakshityadav006@gmail.com")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
