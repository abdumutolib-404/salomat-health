"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Mail, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const { user, firebaseUser, verifyEmail } = useAuth()
  const { t } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (user && user.emailVerified) {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim() || otp.length !== 6) {
      toast({
        title: t("common.error"),
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // In a real implementation, you would verify the OTP with your backend
      // For now, we'll simulate the verification
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: t("common.success"),
        description: "Email verified successfully!",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || "Failed to verify email",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    setResendLoading(true)
    try {
      await verifyEmail()
      toast({
        title: t("common.success"),
        description: "Verification code sent to your email",
      })
      setCountdown(60)
      setCanResend(false)
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{t("auth.verifyEmail")}</CardTitle>
            <CardDescription>We've sent a verification code to {user?.email}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium">
                  {t("auth.enterOTP")}
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Email
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
              <Button
                variant="ghost"
                onClick={handleResendOTP}
                disabled={!canResend || resendLoading}
                className="text-sm"
              >
                {resendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {canResend ? t("auth.resendOTP") : `Resend in ${countdown}s`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
