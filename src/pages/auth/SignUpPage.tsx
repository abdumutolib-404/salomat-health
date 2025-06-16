"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { useToast } from "../../hooks/useToast"
import { User, Stethoscope, Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react"

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

export const SignUpPage: React.FC = () => {
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
  const navigate = useNavigate()

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
      } else if (formData.password.length < 8) {
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
        title: "Success",
        description: "Account created successfully. Please verify your email.",
        type: "success",
      })

      navigate("/auth/verify-email")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("auth.signup")}</CardTitle>
          <CardDescription>Step {step} of 3 - Create your account to get started</CardDescription>

          {/* Progress Bar */}
          <div className="flex space-x-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i <= step ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                } transition-colors`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium mb-2">Choose your role</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Are you a patient looking for care or a doctor providing care?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setRole("patient")}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    role === "patient"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                  }`}
                >
                  <User className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h4 className="font-medium mb-2">{t("auth.patient")}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    I'm looking for medical care and consultations
                  </p>
                </button>

                <button
                  onClick={() => setRole("doctor")}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    role === "doctor"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                  }`}
                >
                  <Stethoscope className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h4 className="font-medium mb-2">{t("auth.doctor")}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    I'm a healthcare professional providing care
                  </p>
                </button>
              </div>

              {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}

              <Button onClick={handleNext} className="w-full" disabled={!role}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t("auth.firstName")}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  error={errors.firstName}
                />
                <Input
                  label={t("auth.lastName")}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  error={errors.lastName}
                />
              </div>

              <Input
                label={t("auth.email")}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label={t("auth.password")}
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label={t("auth.confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={`${t("auth.phone")} (Optional)`}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                {role === "patient" && (
                  <Input
                    label={`${t("auth.age")} (Optional)`}
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                )}
              </div>

              {role === "doctor" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("auth.specialization")}</label>
                      <select
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select specialization</option>
                        {specializations.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                      {errors.specialization && <p className="text-sm text-red-600 mt-1">{errors.specialization}</p>}
                    </div>

                    <Input
                      label={t("auth.experience")}
                      type="number"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      error={errors.experience}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t("auth.bio")} (Optional)</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Tell patients about yourself..."
                    />
                  </div>

                  <Input
                    label={`${t("auth.consultationFee")} (USD, Optional)`}
                    type="number"
                    step="0.01"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                  />
                </>
              )}

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Terms and Privacy */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium mb-2">Terms and Privacy</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Please review and accept our terms and privacy policy
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="terms" className="text-sm font-medium">
                      {t("auth.termsAccept")}
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      You agree to our{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>
                    </p>
                  </div>
                </div>
                {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={formData.privacyAccepted}
                    onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="privacy" className="text-sm font-medium">
                      {t("auth.privacyAccept")}
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      You agree to our{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </div>
                {errors.privacy && <p className="text-sm text-red-600">{errors.privacy}</p>}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" loading={loading}>
                    Create Account
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
