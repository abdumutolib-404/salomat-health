"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

  const router = useRouter()

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!role) {
        newErrors.role = "Please select a role"
      }
    }

    if (currentStep === 2) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required"
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required"
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format"
      }
      if (!formData.password) {
        newErrors.password = "Password is required"
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters"
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }

      if (role === "doctor") {
        if (!formData.specialization) {
          newErrors.specialization = "Specialization is required"
        }
        if (!formData.experience) {
          newErrors.experience = "Experience is required"
        }
      }
    }

    if (currentStep === 3) {
      if (!formData.termsAccepted) {
        newErrors.terms = "You must accept the terms of service"
      }
      if (!formData.privacyAccepted) {
        newErrors.privacy = "You must accept the privacy policy"
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
      // TODO: Implement actual signup logic with Firebase
      console.log("Signup data:", { ...formData, role })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      router.push("/auth/verify-email")
    } catch (error: any) {
      console.error("Signup error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
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
                  <h4 className="font-medium mb-2">Patient</h4>
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
                  <h4 className="font-medium mb-2">Doctor</h4>
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
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                {role === "patient" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Age (Optional)</label>
                    <Input
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
                    <div>
                      <label className="block text-sm font-medium mb-2">Specialization</label>
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

                    <div>
                      <label className="block text-sm font-medium mb-2">Years of Experience</label>
                      <Input
                        type="number"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className={errors.experience ? "border-red-500" : ""}
                      />
                      {errors.experience && <p className="text-sm text-red-600 mt-1">{errors.experience}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bio (Optional)</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Tell patients about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Consultation Fee (USD, Optional)</label>
                    <Input
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
                      I accept the Terms of Service
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      You agree to our{" "}
                      <Link href="/terms" className="text-primary hover:underline">
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
                      I accept the Privacy Policy
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      You agree to our{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
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
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
