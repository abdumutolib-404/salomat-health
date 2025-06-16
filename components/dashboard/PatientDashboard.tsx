"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Bell, FileText, User, Calendar, Brain, Upload } from "lucide-react"
import { AnalysisUpload } from "@/components/AnalysisUpload"
import { RemindersList } from "@/components/RemindersList"
import { motion } from "framer-motion"
import Link from "next/link"

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [showUpload, setShowUpload] = useState(false)

  if (!user?.emailVerified) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Email Verification Required</h3>
            <p className="text-muted-foreground mb-4">Please verify your email address to access all features.</p>
            <Link href="/auth/verify-email">
              <Button>Verify Email</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const dashboardCards = [
    {
      title: t("dashboard.chats"),
      description: "Chat with your doctors",
      icon: <MessageCircle className="h-6 w-6" />,
      href: "/chats",
      color: "bg-blue-500",
      count: 3,
    },
    {
      title: t("dashboard.chatWithAI"),
      description: "Get instant health insights",
      icon: <Brain className="h-6 w-6" />,
      href: "/chat",
      color: "bg-green-500",
      disabled: user?.plan === "guest",
    },
    {
      title: t("dashboard.findDoctors"),
      description: "Connect with healthcare professionals",
      icon: <User className="h-6 w-6" />,
      href: "/doctors",
      color: "bg-indigo-500",
    },
    {
      title: t("dashboard.appointments"),
      description: "Manage your appointments",
      icon: <Calendar className="h-6 w-6" />,
      href: "/appointments",
      color: "bg-purple-500",
      count: 2,
    },
    {
      title: t("dashboard.prescriptions"),
      description: "View your prescriptions",
      icon: <FileText className="h-6 w-6" />,
      href: "/prescriptions",
      color: "bg-orange-500",
      count: 1,
    },
    {
      title: t("dashboard.notes"),
      description: "Manage reminders and notes",
      icon: <Bell className="h-6 w-6" />,
      href: "/reminders",
      color: "bg-yellow-500",
      count: 5,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6"
      >
        <h2 className="text-2xl font-bold mb-2">
          {t("dashboard.welcome")}, {user?.firstName}! 👋
        </h2>
        <p className="text-muted-foreground">How are you feeling today? Your health journey continues here.</p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{user?.plan}</div>
              <p className="text-xs text-muted-foreground">Current subscription</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.tokenUsedToday || 0}</div>
              <p className="text-xs text-muted-foreground">Used today</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{user?.subscriptionStatus}</div>
              <p className="text-xs text-muted-foreground">Account status</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowUpload(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Upload</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-primary">Upload Analysis</div>
              <p className="text-xs text-muted-foreground">Click to upload</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
          >
            <Link href={card.disabled ? "#" : card.href}>
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                  card.disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center text-white`}>
                      {card.icon}
                    </div>
                    {card.count && (
                      <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {card.count}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled={card.disabled}>
                    {card.disabled ? "Upgrade Required" : "Open"}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
              <CardDescription>Your latest analysis uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No uploads yet</p>
                <p className="text-sm">Upload your first analysis to get started</p>
                <Button className="mt-4" onClick={() => setShowUpload(true)}>
                  Upload Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Reminders</CardTitle>
              <CardDescription>Your scheduled reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <RemindersList />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upload Modal */}
      {showUpload && <AnalysisUpload onClose={() => setShowUpload(false)} />}
    </div>
  )
}
