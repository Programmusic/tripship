import admin from 'firebase-admin'

let firestore = null

export function isFirestoreEnabled() {
  return !!process.env.FIREBASE_PROJECT_ID
}

export function getFirestore() {
  if (!isFirestoreEnabled()) return null
  if (firestore) return firestore

  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId,
      })
    } else {
      admin.initializeApp({ projectId })
    }
  }

  firestore = admin.firestore()
  return firestore
}

export const LATTICE_PROFILES_COLLECTION = 'lattice_profiles'
