"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search, Star, MessageCircle, Calendar, Loader2, Filter } from "lucide-react"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User } from "@/types"

const categories = [
  { id: "all", name: "All Specialties" },
  { id: "cardiology", name: "Cardiology" },
  { id: "neurology", name: "Neurology" },
  { id: "pediatrics", name: "Pediatrics" },
  { id: "dermatology", name: "Dermatology" },
  { id: "orthopedics", name: "Orthopedics" },
  { id: "psychiatry", name: "Psychiatry" },
  { id: "dentistry", name: "Dentistry" },
  { id: "ophthalmology", name: "Ophthalmology" },
  { id: "gynecology", name: "Gynecology" },
]

const bodyParts = [
  { id: "all", name: "All Body Parts" },
  { id: "heart", name: "Heart" },
  { id: "brain", name: "Brain & Nervous System" },
  { id: "bones", name: "Bones & Joints" },
  { id: "skin", name: "Skin" },
  { id: "eyes", name: "Eyes" },
  { id: "teeth", name: "Teeth & Oral" },
  { id: "reproductive", name: "Reproductive Health" },
  { id: "digestive", name: "Digestive System" },
]

export default function DoctorsPage() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [doctors, setDoctors] = useState<User[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedBodyPart, setSelectedBodyPart] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [loadingDoctors, setLoadingDoctors] = useState(true)

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      const doctorsQuery = query(collection(db, "users"), where("role", "==", "doctor"), orderBy("rating", "desc"))

      const snapshot = await getDocs(doctorsQuery)
      const doctorData = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[]

      setDoctors(doctorData)
      setFilteredDoctors(doctorData)
    } catch (error) {
      console.error("Error loading doctors:", error)
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      })
    } finally {
      setLoadingDoctors(false)
    }
  }

  useEffect(() => {
    let filtered = doctors

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.bio?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((doctor) => doctor.specialization?.toLowerCase() === selectedCategory)
    }

    // Filter by body part (map body parts to categories)
    if (selectedBodyPart !== "all") {
      const bodyPartToCategory: Record<string, string[]> = {
        heart: ["cardiology"],
        brain: ["neurology", "psychiatry"],
        bones: ["orthopedics"],
        skin: ["dermatology"],
        eyes: ["ophthalmology"],
        teeth: ["dentistry"],
        reproductive: ["gynecology"],
        digestive: ["gastroenterology"],
      }

      const relevantCategories = bodyPartToCategory[selectedBodyPart] || []
      if (relevantCategories.length > 0) {
        filtered = filtered.filter((doctor) => relevantCategories.includes(doctor.specialization?.toLowerCase() || ""))
      }
    }

    // Sort doctors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "experience":
          return (b.experience || 0) - (a.experience || 0)
        case "price":
          return (a.consultationFee || 0) - (b.consultationFee || 0)
        case "patients":
          return (b.patientsCount || 0) - (a.patientsCount || 0)
        default:
          return 0
      }
    })

    setFilteredDoctors(filtered)
  }, [searchTerm, selectedCategory, selectedBodyPart, sortBy, doctors])

  const handleChatWithDoctor = (doctorId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to chat with doctors",
      })
      router.push("/auth/login")
      return
    }
    router.push(`/chat/doctor/${doctorId}`)
  }

  const handleBookAppointment = (doctorId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book appointments",
      })
      router.push("/auth/login")
      return
    }
    router.push(`/appointments/book/${doctorId}`)
  }

  const handleViewProfile = (doctorId: string) => {
    router.push(`/doctors/${doctorId}`)
  }

  if (loading || loadingDoctors) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Find a Doctor</h1>
          <p className="text-muted-foreground mb-6">
            Connect with qualified healthcare professionals. Search by specialty, body part, or doctor name.
          </p>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors, specialties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBodyPart} onValueChange={setSelectedBodyPart}>
              <SelectTrigger>
                <SelectValue placeholder="Body Part" />
              </SelectTrigger>
              <SelectContent>
                {bodyParts.map((part) => (
                  <SelectItem key={part.id} value={part.id}>
                    {part.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="price">Lowest Price</SelectItem>
                <SelectItem value="patients">Most Patients</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""}
            {selectedCategory !== "all" && ` in ${categories.find((c) => c.id === selectedCategory)?.name}`}
            {selectedBodyPart !== "all" && ` for ${bodyParts.find((b) => b.id === selectedBodyPart)?.name}`}
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.uid} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader onClick={() => handleViewProfile(doctor.uid)}>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={doctor.profilePicture || "/placeholder.svg"} alt={doctor.fullName} />
                    <AvatarFallback className="text-lg">
                      {doctor.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{doctor.fullName}</CardTitle>
                    <CardDescription>{doctor.specialization}</CardDescription>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="default">Available</Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{doctor.rating || 0}</span>
                        <span className="text-xs text-muted-foreground">({doctor.reviewCount || 0})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{doctor.bio}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Experience</span>
                      <p className="font-medium">{doctor.experience || 0} years</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Patients</span>
                      <p className="font-medium">{(doctor.patientsCount || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">${doctor.consultationFee || 50}</span>
                    <div className="flex flex-wrap gap-1">
                      {(doctor.languages || ["English"]).slice(0, 2).map((lang) => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleChatWithDoctor(doctor.uid)
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBookAppointment(doctor.uid)
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Book
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No doctors found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all available doctors.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setSelectedBodyPart("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
