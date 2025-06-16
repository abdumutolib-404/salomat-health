"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, MessageSquare, CreditCard, Activity } from "lucide-react"

export const SystemAnalytics: React.FC = () => {
  // Mock analytics data - in real app, fetch from Firestore/Analytics
  const analyticsData = {
    userGrowth: {
      current: 1250,
      previous: 1180,
      change: 5.9,
    },
    chatUsage: {
      current: 3420,
      previous: 3180,
      change: 7.5,
    },
    revenue: {
      current: 12450.5,
      previous: 11200.3,
      change: 11.2,
    },
    activeUsers: {
      current: 890,
      previous: 820,
      change: 8.5,
    },
  }

  const recentActivity = [
    { type: "signup", user: "John Doe", time: "2 minutes ago" },
    { type: "payment", user: "Jane Smith", amount: "$9.99", time: "5 minutes ago" },
    { type: "chat", user: "Mike Johnson", messages: "15 messages", time: "8 minutes ago" },
    { type: "upgrade", user: "Sarah Wilson", plan: "Pro", time: "12 minutes ago" },
  ]

  const topDoctors = [
    { name: "Dr. Sarah Johnson", patients: 45, rating: 4.9 },
    { name: "Dr. Michael Chen", patients: 38, rating: 4.8 },
    { name: "Dr. Emily Davis", patients: 32, rating: 4.7 },
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.userGrowth.current.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {analyticsData.userGrowth.change > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={analyticsData.userGrowth.change > 0 ? "text-green-500" : "text-red-500"}>
                {analyticsData.userGrowth.change}%
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.chatUsage.current.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">{analyticsData.chatUsage.change}%</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.revenue.current.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">{analyticsData.revenue.change}%</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeUsers.current.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">{analyticsData.activeUsers.change}%</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        activity.type === "signup"
                          ? "default"
                          : activity.type === "payment"
                            ? "secondary"
                            : activity.type === "chat"
                              ? "outline"
                              : "default"
                      }
                    >
                      {activity.type}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">
                        {"amount" in activity && activity.amount}
                        {"messages" in activity && activity.messages}
                        {"plan" in activity && `Upgraded to ${activity.plan}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Doctors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Doctors</CardTitle>
            <CardDescription>Most active doctors this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDoctors.map((doctor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{doctor.name}</p>
                    <p className="text-xs text-muted-foreground">{doctor.patients} patients</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{doctor.rating}</span>
                      <span className="text-xs text-muted-foreground">★</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
