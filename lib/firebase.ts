import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getFunctions } from "firebase/functions"

const firebaseConfig = {
  apiKey: "AIzaSyDJ6vMNaMI2l8zQQvlOoBPv6j7W0YPnxRo",
  authDomain: "salomat-health.firebaseapp.com",
  projectId: "salomat-health",
  storageBucket: "salomat-health.firebasestorage.app",
  messagingSenderId: "894998180618",
  appId: "1:894998180618:web:56ac37a8c551fdb69700f3",
  measurementId: "G-885NEJQG9C",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)

export default app
