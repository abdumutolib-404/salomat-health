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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Eye, EyeOff, User, Stethoscope } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const specializations = [
  "Cardiologist",
  "Neurologist",
  "Pediatrician",
  "Dermatologist",
  "Orthopedist",
  "Psychiatrist",
  "Dentist",
  "Ophthalmologist",
  "Gynecologist",
  "General Practitioner",
]

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<"patient" | "doctor" | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    age: "",
    specialization: "",
    experience: "",
    bio: "",
    consultationFee: "",
    termsAccepted: false,
    privacyAccepted: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { signUp } = useAuth()
  const { t } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!role) {
        newErrors.role = t("error.requiredField")
      }
    }

    if (currentStep === 2) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = t("error.requiredField")
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = t("error.requiredField")
      }
      if (!formData.email.trim()) {
        newErrors.email = t("error.requiredField")
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t("error.invalidEmail")
      }
      if (!formData.password) {
        newErrors.password = t("error.requiredField")
      } else if (
        formData.password.length < 8 ||
        !/[A-Z]/.test(formData.password) ||
        !/[a-z]/.test(formData.password) ||
        !/[0-9]/.test(formData.password)
      ) {
        newErrors.password = t("error.weakPassword")
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t("error.passwordMismatch")
      }

      if (role === "doctor") {
        if (!formData.specialization) {
          newErrors.specialization = t("error.requiredField")
        }
        if (!formData.experience) {
          newErrors.experience = t("error.requiredField")
        }
      }
    }

    if (currentStep === 3) {
      if (!formData.termsAccepted) {
        newErrors.terms = t("error.requiredField")
      }
      if (!formData.privacyAccepted) {
        newErrors.privacy = t("error.requiredField")
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(3) || !role) return

    setLoading(true)
    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role,
        phone: formData.phone || undefined,
        age: formData.age ? Number.parseInt(formData.age) : undefined,
        specialization: role === "doctor" ? formData.specialization : undefined,
        experience: role === "doctor" ? Number.parseInt(formData.experience) : undefined,
        bio: role === "doctor" ? formData.bio : undefined,
        consultationFee: role === "doctor" ? Number.parseFloat(formData.consultationFee) : undefined,
        termsAccepted: formData.termsAccepted,
        privacyAccepted: formData.privacyAccepted,
      })

      toast({
        title: t("common.success"),
        description: "Account created successfully. Please verify your email.",
      })

      router.push("/auth/verify-email")
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
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("auth.signup")}</CardTitle>
            <CardDescription>Step {step} of 3 - Create your account to get started</CardDescription>
            <div className="flex space-x-2 mt-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"} transition-colors`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium mb-2">Choose your role</h3>
                    <p className="text-muted-foreground">
                      Are you a patient looking for care or a doctor providing care?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        role === "patient" ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setRole("patient")}
                    >
                      <CardContent className="p-6 text-center">
                        <User className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <h4 className="font-medium mb-2">{t("auth.patient")}</h4>
                        <p className="text-sm text-muted-foreground">I'm looking for medical care and consultations</p>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        role === "doctor" ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setRole("doctor")}
                    >
                      <CardContent className="p-6 text-center">
                        <Stethoscope className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <h4 className="font-medium mb-2">{t("auth.doctor")}</h4>
                        <p className="text-sm text-muted-foreground">I'm a healthcare professional providing care</p>
                      </CardContent>
                    </Card>
                  </div>

                  {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}

                  <Button onClick={handleNext} className="w-full" disabled={!role}>
                    Continue
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={errors.firstName ? "border-destructive" : ""}
                      />
                      {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={errors.lastName ? "border-destructive" : ""}
                      />
                      {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">{t("auth.password")}</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className={errors.password ? "border-destructive" : ""}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className={errors.confirmPassword ? "border-destructive" : ""}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("auth.phone")} (Optional)</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    {role === "patient" && (
                      <div className="space-y-2">
                        <Label htmlFor="age">{t("auth.age")} (Optional)</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  {role === "doctor" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="specialization">{t("auth.specialization")}</Label>
                          <Select
                            value={formData.specialization}
                            onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                          >
                            <SelectTrigger className={errors.specialization ? "border-destructive" : ""}>
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                            <SelectContent>
                              {specializations.map((spec) => (
                                <SelectItem key={spec} value={spec}>
                                  {spec}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.specialization && <p className="text-sm text-destructive">{errors.specialization}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="experience">{t("auth.experience")}</Label>
                          <Input
                            id="experience"
                            type="number"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            className={errors.experience ? "border-destructive" : ""}
                          />
                          {errors.experience && <p className="text-sm text-destructive">{errors.experience}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">{t("auth.bio")} (Optional)</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Tell patients about yourself..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="consultationFee">{t("auth.consultationFee")} (USD, Optional)</Label>
                        <Input
                          id="consultationFee"
                          type="number"
                          step="0.01"
                          value={formData.consultationFee}
                          onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleNext} className="flex-1">
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium mb-2">Terms and Privacy</h3>
                    <p className="text-muted-foreground">Please review and accept our terms and privacy policy</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t("auth.termsAccept")}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          You agree to our{" "}
                          <Link href="/terms" className="underline hover:text-primary">
                            Terms of Service
                          </Link>
                        </p>
                      </div>
                    </div>
                    {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="privacy"
                        checked={formData.privacyAccepted}
                        onCheckedChange={(checked) => setFormData({ ...formData, privacyAccepted: checked as boolean })}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="privacy"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t("auth.privacyAccept")}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          You agree to our{" "}
                          <Link href="/privacy" className="underline hover:text-primary">
                            Privacy Policy
                          </Link>
                        </p>
                      </div>
                    </div>
                    {errors.privacy && <p className="text-sm text-destructive">{errors.privacy}</p>}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                        Back
                      </Button>
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
