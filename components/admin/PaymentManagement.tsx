"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, RefreshCw } from "lucide-react"

interface Payment {
  id: string
  userId: string
  userName: string
  amount: number
  plan: string
  status: "completed" | "pending" | "failed"
  provider: "stripe" | "click"
  date: Date
}

export const PaymentManagement: React.FC = () => {
  // Mock payment data
  const payments: Payment[] = [
    {
      id: "pay_1",
      userId: "user_1",
      userName: "John Doe",
      amount: 9.99,
      plan: "Pro",
      status: "completed",
      provider: "stripe",
      date: new Date(Date.now() - 86400000),
    },
    {
      id: "pay_2",
      userId: "user_2",
      userName: "Jane Smith",
      amount: 9.99,
      plan: "Pro",
      status: "pending",
      provider: "click",
      date: new Date(Date.now() - 172800000),
    },
    {
      id: "pay_3",
      userId: "user_3",
      userName: "Mike Johnson",
      amount: 9.99,
      plan: "Pro",
      status: "failed",
      provider: "stripe",
      date: new Date(Date.now() - 259200000),
    },
  ]

  const totalRevenue = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)

  const pendingPayments = payments.filter((p) => p.status === "pending").length
  const failedPayments = payments.filter((p) => p.status === "failed").length

  return (
    <div className="space-y-6">
      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedPayments}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Manage payments and subscriptions</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search payments..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="click">Click</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments List */}
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{payment.userName}</h3>
                      <Badge
                        variant={
                          payment.status === "completed"
                            ? "default"
                            : payment.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {payment.status}
                      </Badge>
                      <Badge variant="outline">{payment.provider}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Payment ID: {payment.id} | Plan: {payment.plan}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.date.toLocaleDateString()} at {payment.date.toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <span className="text-lg font-bold">${payment.amount}</span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      {payment.status === "failed" && (
                        <Button size="sm" variant="outline">
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
