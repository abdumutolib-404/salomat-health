"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { User } from "@/types"
import { secureStorage, sessionStore } from "@/lib/storage"
import { sanitizeInput, isValidEmail, isValidPassword } from "@/lib/security"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (userData: SignUpData) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  verifyEmail: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: "patient" | "doctor"
  phone?: string
  age?: number
  specialization?: string
  experience?: number
  bio?: string
  consultationFee?: number
  termsAccepted: boolean
  privacyAccepted: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser)
        await loadUserData(firebaseUser.uid)
      } else {
        setFirebaseUser(null)
        setUser(null)
        secureStorage.removeItem("user")
        sessionStore.clear()
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const loadUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        const userData = { uid, ...userDoc.data() } as User
        setUser(userData)
        secureStorage.setItem("user", userData)

        // Update last active
        await updateDoc(doc(db, "users", uid), {
          lastActive: new Date(),
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const sanitizedEmail = sanitizeInput(email)

    if (!isValidEmail(sanitizedEmail)) {
      throw new Error("Invalid email address")
    }

    try {
      await signInWithEmailAndPassword(auth, sanitizedEmail, password)
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign in")
    }
  }

  const signUp = async (userData: SignUpData) => {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      age,
      specialization,
      experience,
      bio,
      consultationFee,
      termsAccepted,
      privacyAccepted,
    } = userData

    // Validation
    if (!isValidEmail(email)) {
      throw new Error("Invalid email address")
    }

    if (!isValidPassword(password)) {
      throw new Error("Password must be at least 8 characters with uppercase, lowercase, and numbers")
    }

    if (!termsAccepted || !privacyAccepted) {
      throw new Error("You must accept the terms and privacy policy")
    }

    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)

      const newUserData: Omit<User, "uid"> = {
        role,
        fullName: `${sanitizeInput(firstName)} ${sanitizeInput(lastName)}`,
        firstName: sanitizeInput(firstName),
        lastName: sanitizeInput(lastName),
        email: sanitizeInput(email),
        phone: phone ? sanitizeInput(phone) : undefined,
        age: age || undefined,
        lang: "en",
        plan: "free",
        tokenUsedToday: 0,
        subscriptionStatus: "active",
        emailVerified: false,
        specialization: role === "doctor" ? sanitizeInput(specialization || "") : undefined,
        experience: role === "doctor" ? experience : undefined,
        bio: role === "doctor" ? sanitizeInput(bio || "") : undefined,
        consultationFee: role === "doctor" ? consultationFee : undefined,
        rating: role === "doctor" ? 0 : undefined,
        reviewCount: role === "doctor" ? 0 : undefined,
        patientsCount: role === "doctor" ? 0 : undefined,
        languages: role === "doctor" ? ["English"] : undefined,
        createdAt: new Date(),
        termsAccepted: true,
        privacyAccepted: true,
      }

      await setDoc(doc(db, "users", firebaseUser.uid), newUserData)
      await sendEmailVerification(firebaseUser)
    } catch (error: any) {
      throw new Error(error.message || "Failed to create account")
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const { user: firebaseUser } = await signInWithPopup(auth, provider)

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (!userDoc.exists()) {
        // New Google user - redirect to complete profile
        sessionStore.set("needsProfileCompletion", true)
        const userData: Omit<User, "uid"> = {
          role: "patient", // Default role, will be updated in profile completion
          fullName: firebaseUser.displayName || "",
          firstName: firebaseUser.displayName?.split(" ")[0] || "",
          lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
          email: firebaseUser.email || "",
          lang: "en",
          plan: "free",
          tokenUsedToday: 0,
          subscriptionStatus: "active",
          emailVerified: firebaseUser.emailVerified,
          createdAt: new Date(),
          termsAccepted: false, // Will be asked in profile completion
          privacyAccepted: false,
        }
        await setDoc(doc(db, "users", firebaseUser.uid), userData)
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign in with Google")
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      secureStorage.clear()
      sessionStore.clear()
    } catch (error: any) {
      throw new Error(error.message || "Failed to logout")
    }
  }

  const resetPassword = async (email: string) => {
    const sanitizedEmail = sanitizeInput(email)

    if (!isValidEmail(sanitizedEmail)) {
      throw new Error("Invalid email address")
    }

    try {
      await sendPasswordResetEmail(auth, sanitizedEmail)
    } catch (error: any) {
      throw new Error(error.message || "Failed to send reset email")
    }
  }

  const verifyEmail = async () => {
    if (!firebaseUser) {
      throw new Error("No user logged in")
    }

    try {
      await sendEmailVerification(firebaseUser)
    } catch (error: any) {
      throw new Error(error.message || "Failed to send verification email")
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      throw new Error("No user logged in")
    }

    try {
      const sanitizedData = Object.keys(data).reduce(
        (acc, key) => {
          const value = data[key as keyof User]
          if (typeof value === "string") {
            acc[key as keyof User] = sanitizeInput(value) as any
          } else {
            acc[key as keyof User] = value as any
          }
          return acc
        },
        {} as Partial<User>,
      )

      await updateDoc(doc(db, "users", user.uid), sanitizedData)
      const updatedUser = { ...user, ...sanitizedData }
      setUser(updatedUser)
      secureStorage.setItem("user", updatedUser)
    } catch (error: any) {
      throw new Error(error.message || "Failed to update profile")
    }
  }

  const refreshUser = async () => {
    if (firebaseUser) {
      await loadUserData(firebaseUser.uid)
    }
  }

  const value = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    verifyEmail,
    updateProfile,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
