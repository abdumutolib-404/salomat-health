"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
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
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../firebase/config"
import type { User } from "../types"
import { useToast } from "../hooks/useToast"

interface AuthContextType {
  currentUser: FirebaseUser | null
  user: User | null
  loading: boolean
  signUp: (userData: SignUpData) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  verifyEmail: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser)

      if (firebaseUser) {
        await loadUserData(firebaseUser.uid)
      } else {
        setUser(null)
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

        // Update last active
        await updateDoc(doc(db, "users", uid), {
          lastActive: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
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

    if (!termsAccepted || !privacyAccepted) {
      throw new Error("You must accept the terms and privacy policy")
    }

    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)

      const newUserData: Omit<User, "uid"> = {
        role,
        fullName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        age: age || undefined,
        lang: "en",
        plan: "free",
        tokenUsedToday: 0,
        subscriptionStatus: "active",
        emailVerified: false,
        specialization: role === "doctor" ? specialization : undefined,
        experience: role === "doctor" ? experience : undefined,
        bio: role === "doctor" ? bio : undefined,
        consultationFee: role === "doctor" ? consultationFee : undefined,
        rating: role === "doctor" ? 0 : undefined,
        reviewCount: role === "doctor" ? 0 : undefined,
        patientsCount: role === "doctor" ? 0 : undefined,
        languages: role === "doctor" ? ["English"] : undefined,
        availability: role === "doctor" ? "available" : undefined,
        createdAt: new Date(),
        termsAccepted: true,
        privacyAccepted: true,
      }

      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...newUserData,
        createdAt: serverTimestamp(),
      })

      await sendEmailVerification(firebaseUser)

      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account.",
        type: "success",
      })
    } catch (error: any) {
      throw new Error(error.message || "Failed to create account")
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign in")
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const { user: firebaseUser } = await signInWithPopup(auth, provider)

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (!userDoc.exists()) {
        // New Google user - create basic profile
        const userData: Omit<User, "uid"> = {
          role: "patient", // Default role
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
          termsAccepted: false, // Will need to accept terms
          privacyAccepted: false,
        }

        await setDoc(doc(db, "users", firebaseUser.uid), {
          ...userData,
          createdAt: serverTimestamp(),
        })
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign in with Google")
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error: any) {
      throw new Error(error.message || "Failed to logout")
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw new Error(error.message || "Failed to send reset email")
    }
  }

  const verifyEmail = async () => {
    if (!currentUser) {
      throw new Error("No user logged in")
    }

    try {
      await sendEmailVerification(currentUser)
    } catch (error: any) {
      throw new Error(error.message || "Failed to send verification email")
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      throw new Error("No user logged in")
    }

    try {
      await updateDoc(doc(db, "users", user.uid), data)
      setUser({ ...user, ...data })
    } catch (error: any) {
      throw new Error(error.message || "Failed to update profile")
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) {
      throw new Error("No user logged in")
    }

    try {
      const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword)
      await reauthenticateWithCredential(currentUser, credential)
      await updatePassword(currentUser, newPassword)
    } catch (error: any) {
      throw new Error(error.message || "Failed to change password")
    }
  }

  const refreshUser = async () => {
    if (currentUser) {
      await loadUserData(currentUser.uid)
    }
  }

  const value = {
    currentUser,
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    verifyEmail,
    updateProfile,
    changePassword,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
