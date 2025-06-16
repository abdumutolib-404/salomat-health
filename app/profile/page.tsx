"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Camera, Save, Mail, Phone, User, Stethoscope, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function ProfilePage() {
  const { user, updateProfile, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    bio: "",
    specialization: "",
    experience: "",
    consultationFee: "",
    languages: [] as string[],
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        age: user.age?.toString() || "",
        bio: user.bio || "",
        specialization: user.specialization || "",
        experience: user.experience?.toString() || "",
        consultationFee: user.consultationFee?.toString() || "",
        languages: user.languages || [],
      })
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone || undefined,
        age: formData.age ? Number.parseInt(formData.age) : undefined,
      }

      if (user.role === "doctor") {
        updateData.bio = formData.bio
        updateData.specialization = formData.specialization
        updateData.experience = formData.experience ? Number.parseInt(formData.experience) : undefined
        updateData.consultationFee = formData.consultationFee ? Number.parseFloat(formData.consultationFee) : undefined
        updateData.languages = formData.languages
      }

      // If email changed, require verification
      if (formData.email !== user.email) {
        updateData.email = formData.email
        updateData.emailVerified = false
        setEmailVerificationSent(true)
      }

      await updateProfile(updateData)

      toast({
        title: t("common.success"),
        description: "Profile updated successfully",
      })
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("common.error"),
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("common.error"),
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      // In real implementation, upload to Firebase Storage
      const imageUrl = URL.createObjectURL(file)
      await updateProfile({ profilePicture: imageUrl })

      toast({
        title: t("common.success"),
        description: "Profile picture updated",
      })
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Picture */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Upload a professional photo</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-32 h-32 mx-auto mb-4">
                      <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.fullName} />
                      <AvatarFallback className="text-2xl">
                        {user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-4 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">JPG, PNG up to 5MB</p>
                </CardContent>
              </Card>

              {/* Profile Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {user.role === "doctor" ? <Stethoscope className="h-5 w-5" /> : <User className="h-5 w-5" />}
                      <span>Personal Information</span>
                    </CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{t("auth.email")}</span>
                          {!user.emailVerified && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Not Verified
                            </span>
                          )}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                        {emailVerificationSent && (
                          <p className="text-sm text-muted-foreground">Verification email sent to new address</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{t("auth.phone")}</span>
                          </Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        {user.role === "patient" && (
                          <div className="space-y-2">
                            <Label htmlFor="age">{t("auth.age")}</Label>
                            <Input
                              id="age"
                              type="number"
                              value={formData.age}
                              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            />
                          </div>
                        )}
                      </div>

                      {/* Doctor-specific fields */}
                      {user.role === "doctor" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="bio">{t("auth.bio")}</Label>
                            <Textarea
                              id="bio"
                              value={formData.bio}
                              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                              placeholder="Tell patients about yourself..."
                              rows={4}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="specialization">{t("auth.specialization")}</Label>
                              <Select
                                value={formData.specialization}
                                onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                                  <SelectItem value="Neurologist">Neurologist</SelectItem>
                                  <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                                  <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                                  <SelectItem value="Orthopedist">Orthopedist</SelectItem>
                                  <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                                  <SelectItem value="Dentist">Dentist</SelectItem>
                                  <SelectItem value="Ophthalmologist">Ophthalmologist</SelectItem>
                                  <SelectItem value="Gynecologist">Gynecologist</SelectItem>
                                  <SelectItem value="General Practitioner">General Practitioner</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="experience">{t("auth.experience")}</Label>
                              <Input
                                id="experience"
                                type="number"
                                value={formData.experience}
                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="consultationFee">{t("auth.consultationFee")} (USD)</Label>
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

                      <Button type="submit" disabled={loading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        {t("common.save")} Changes
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
