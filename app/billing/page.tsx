"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Check, Crown, Zap } from "lucide-react"

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "month",
    features: [
      "Basic health consultations",
      "10 AI chat messages per day",
      "Upload medical reports",
      "Basic reminders",
    ],
    icon: <Zap className="h-6 w-6" />,
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    currency: "USD",
    interval: "month",
    features: [
      "Unlimited AI chat messages",
      "Priority doctor consultations",
      "Advanced health analytics",
      "Prescription management",
      "Custom reminders",
      "Export health reports",
    ],
    icon: <Crown className="h-6 w-6" />,
    popular: true,
  },
]

export default function BillingPage() {
  const { user, firebaseUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, router])

  const handleSubscribe = async (planId: string) => {
    if (!user || !firebaseUser) return

    setLoading(planId)
    try {
      const idToken = await firebaseUser.getIdToken()

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          planId,
          provider: "stripe", // Default to Stripe, can be changed to Click for Uzbekistan
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Error",
        description: "Failed to start checkout process",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground">Upgrade your healthcare experience with our premium features</p>
        </div>

        {/* Current Plan Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your current subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium capitalize">{user.plan} Plan</p>
                <p className="text-sm text-muted-foreground">
                  Status:{" "}
                  <Badge variant={user.subscriptionStatus === "active" ? "default" : "secondary"}>
                    {user.subscriptionStatus}
                  </Badge>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tokens used today</p>
                <p className="text-2xl font-bold">{user.tokenUsedToday || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">{plan.icon}</div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id || user.plan === plan.id}
                >
                  {loading === plan.id
                    ? "Processing..."
                    : user.plan === plan.id
                      ? "Current Plan"
                      : plan.price === 0
                        ? "Downgrade to Free"
                        : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">No payment history available</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
