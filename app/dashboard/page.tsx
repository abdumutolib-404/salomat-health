"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Navbar } from "@/components/Navbar"
import { PatientDashboard } from "@/components/dashboard/PatientDashboard"
import { DoctorDashboard } from "@/components/dashboard/DoctorDashboard"
import { AdminDashboard } from "@/components/dashboard/AdminDashboard"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "patient":
        return <PatientDashboard />
      case "doctor":
        return <DoctorDashboard />
      case "admin":
        return <AdminDashboard />
      default:
        return <div>Invalid role</div>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {t("dashboard.welcome")}, {user.fullName}
        </h1>
        {renderDashboard()}
      </div>
    </div>
  )
}
