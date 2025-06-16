"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Check, Crown, Zap, Loader2 } from "lucide-react"

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "UZS",
    interval: "month",
    features: [
      "Basic health consultations",
      "200K AI tokens per day",
      "Upload medical reports",
      "Basic reminders",
      "Free AI models only",
      "Email support",
    ],
    icon: <Zap className="h-6 w-6" />,
    popular: false,
    description: "Perfect for getting started with telemedicine",
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    currency: "UZS",
    interval: "month",
    features: [
      "Unlimited AI chat messages",
      "Priority doctor consultations",
      "Advanced health analytics",
      "Prescription management",
      "Custom reminders",
      "Export health reports",
      "Premium AI models",
      "24/7 priority support",
      "Video consultations",
      "Advanced notifications",
    ],
    icon: <Crown className="h-6 w-6" />,
    popular: true,
    description: "Complete healthcare management solution",
  },
]

export default function PricingPage() {
  const { user, firebaseUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    if (!user || !firebaseUser) {
      router.push("/auth/login")
      return
    }

    if (user.plan === planId) {
      toast({
        title: "Already Subscribed",
        description: `You are already on the ${planId} plan`,
      })
      return
    }

    if (planId === "free") {
      toast({
        title: "Free Plan",
        description: "You are already on the free plan",
      })
      return
    }

    setLoading(planId)
    try {
      const idToken = await firebaseUser.getIdToken()

      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          planId,
        }),
      })

      const data = await response.json()

      if (data.paymentUrl) {
        // Redirect to Payme payment page
        window.location.href = data.paymentUrl
      } else {
        throw new Error("Failed to create payment")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Error",
        description: "Failed to start payment process",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upgrade your healthcare experience with our premium features. Start free and scale as your needs grow.
          </p>
        </div>

        {/* Current Plan Status */}
        {user && (
          <Card className="mb-12 max-w-2xl mx-auto">
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
        )}

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">{plan.icon}</div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-4xl font-bold">
                  {plan.price.toLocaleString()} {plan.currency}
                  <span className="text-lg font-normal text-muted-foreground">/{plan.interval}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id || (user && user.plan === plan.id)}
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : user && user.plan === plan.id ? (
                    "Current Plan"
                  ) : plan.price === 0 ? (
                    "Get Started Free"
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-4">Secure Payment Methods</h3>
          <div className="flex justify-center items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                PAYME
              </div>
              <span className="text-sm text-muted-foreground">Payme</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                CLICK
              </div>
              <span className="text-sm text-muted-foreground">Click</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            All payments are processed securely. Your payment information is encrypted and protected.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next
                  billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept Payme and Click payment systems for users in Uzbekistan. International payment methods will
                  be added soon.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our Free plan gives you access to basic features forever. You can upgrade to Pro anytime to unlock
                  premium features.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How secure is my health data?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We use enterprise-grade encryption and comply with international healthcare data protection standards
                  to ensure your health data is completely secure and private.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
