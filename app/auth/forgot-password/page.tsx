"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Mail, Loader2, Key } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1) // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const { resetPassword } = useAuth()
  const { t } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast({
        title: t("common.error"),
        description: t("error.requiredField"),
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await resetPassword(email)
      toast({
        title: t("common.success"),
        description: "Reset code sent to your email",
      })
      setStep(2)
      setCountdown(60)
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast({
        title: t("common.error"),
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStep(3)
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: "Invalid verification code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 8) {
      toast({
        title: t("common.error"),
        description: t("error.weakPassword"),
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t("common.error"),
        description: t("error.passwordMismatch"),
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // In real implementation, update password with backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: t("common.success"),
        description: "Password updated successfully",
      })

      router.push("/auth/login")
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              {step === 1 && <Mail className="h-8 w-8 text-primary" />}
              {step === 2 && <Mail className="h-8 w-8 text-primary" />}
              {step === 3 && <Key className="h-8 w-8 text-primary" />}
            </div>
            <CardTitle className="text-2xl">
              {step === 1 && "Reset Password"}
              {step === 2 && "Verify Code"}
              {step === 3 && "New Password"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Enter your email to receive a reset code"}
              {step === 2 && `We've sent a code to ${email}`}
              {step === 3 && "Enter your new password"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSendOTP}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Code
                  </Button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOTP}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
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
                    Verify Code
                  </Button>

                  <Button type="button" variant="ghost" onClick={() => setStep(1)} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Email
                  </Button>
                </motion.form>
              )}

              {step === 3 && (
                <motion.form
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleResetPassword}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <Link href="/auth/login" className="text-sm text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
