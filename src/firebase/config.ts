import { initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"
import { getFunctions, connectFunctionsEmulator } from "firebase/functions"
import { getMessaging, isSupported } from "firebase/messaging"

const firebaseConfig = {
  apiKey: "AIzaSyDJ6vMNaMI2l8zQQvlOoBPv6j7W0YPnxRo",
  authDomain: "salomat-health.firebaseapp.com",
  projectId: "salomat-health",
  storageBucket: "salomat-health.firebasestorage.app",
  messagingSenderId: "894998180618",
  appId: "1:894998180618:web:56ac37a8c551fdb69700f3",
  measurementId: "G-885NEJQG9C",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)

// Initialize messaging if supported
export const messaging = isSupported().then((yes) => (yes ? getMessaging(app) : null))

// Connect to emulators in development
if (process.env.NODE_ENV === "development") {
  try {
    connectAuthEmulator(auth, "http://localhost:9099")
    connectFirestoreEmulator(db, "localhost", 8080)
    connectStorageEmulator(storage, "localhost", 9199)
    connectFunctionsEmulator(functions, "localhost", 5001)
  } catch (error) {
    console.log("Emulators already connected or not available")
  }
}

export default app
