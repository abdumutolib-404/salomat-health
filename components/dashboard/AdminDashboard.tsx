"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Activity, CreditCard, Settings } from "lucide-react"
import { UserManagement } from "@/components/admin/UserManagement"
import { SystemAnalytics } from "@/components/admin/SystemAnalytics"
import { PaymentManagement } from "@/components/admin/PaymentManagement"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  activeModels: number
  todaySignups: number
  todayChats: number
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    activeModels: 0,
    todaySignups: 0,
    todayChats: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users
        const usersSnapshot = await getDocs(collection(db, "users"))
        const totalUsers = usersSnapshot.size

        // Fetch active users (users with active subscriptions)
        const activeUsersQuery = query(collection(db, "users"), where("subscriptionStatus", "==", "active"))
        const activeUsersSnapshot = await getDocs(activeUsersQuery)
        const activeUsers = activeUsersSnapshot.size

        // Mock data for other stats (in real app, calculate from actual data)
        setStats({
          totalUsers,
          activeUsers,
          totalRevenue: 1250.5,
          activeModels: 3,
          todaySignups: 5,
          todayChats: 42,
        })
      } catch (error) {
        console.error("Error fetching admin stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      description: "Registered users",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      change: `+${stats.todaySignups} today`,
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toString(),
      description: "Users with active subscriptions",
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
      change: "Current active users",
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      description: "Total revenue",
      icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
      change: "This month",
    },
    {
      title: "AI Models",
      value: stats.activeModels.toString(),
      description: "Active AI models",
      icon: <Settings className="h-4 w-4 text-muted-foreground" />,
      change: "Currently active",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <SystemAnalytics />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentManagement />
        </TabsContent>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>AI Models Management</CardTitle>
              <CardDescription>Manage AI models and their configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                AI Models management interface will be implemented here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
