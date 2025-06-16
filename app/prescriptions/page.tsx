"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Search, Download, Calendar, User, Loader2 } from "lucide-react"

interface Prescription {
  id: string
  doctorName: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  prescribedAt: Date
  status: "active" | "completed" | "cancelled"
}

export default function PrescriptionsPage() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Mock prescriptions data - in real app, fetch from Firestore
    const mockPrescriptions: Prescription[] = [
      {
        id: "1",
        doctorName: "Dr. Sarah Johnson",
        medication: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take with food in the morning",
        prescribedAt: new Date(Date.now() - 86400000 * 2),
        status: "active",
      },
      {
        id: "2",
        doctorName: "Dr. Michael Chen",
        medication: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "90 days",
        instructions: "Take with meals",
        prescribedAt: new Date(Date.now() - 86400000 * 7),
        status: "active",
      },
      {
        id: "3",
        doctorName: "Dr. Emily Davis",
        medication: "Amoxicillin",
        dosage: "250mg",
        frequency: "Three times daily",
        duration: "7 days",
        instructions: "Complete full course even if feeling better",
        prescribedAt: new Date(Date.now() - 86400000 * 14),
        status: "completed",
      },
    ]

    setPrescriptions(mockPrescriptions)
    setFilteredPrescriptions(mockPrescriptions)
  }, [])

  useEffect(() => {
    const filtered = prescriptions.filter(
      (prescription) =>
        prescription.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredPrescriptions(filtered)
  }, [searchTerm, prescriptions])

  const downloadPrescription = (prescriptionId: string) => {
    toast({
      title: "Download Started",
      description: "Prescription PDF is being generated",
    })
    // In real app, generate and download PDF
  }

  if (loading) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">My Prescriptions</h1>
          <p className="text-muted-foreground mb-6">View and manage your medical prescriptions</p>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredPrescriptions.map((prescription) => (
            <Card key={prescription.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{prescription.medication}</span>
                      <Badge
                        variant={
                          prescription.status === "active"
                            ? "default"
                            : prescription.status === "completed"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {prescription.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2 mt-1">
                      <User className="h-4 w-4" />
                      <span>Prescribed by {prescription.doctorName}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => downloadPrescription(prescription.id)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dosage</p>
                    <p className="font-medium">{prescription.dosage}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Frequency</p>
                    <p className="font-medium">{prescription.frequency}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p className="font-medium">{prescription.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Prescribed</p>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <p className="font-medium text-sm">{prescription.prescribedAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Instructions</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{prescription.instructions}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPrescriptions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No prescriptions found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
