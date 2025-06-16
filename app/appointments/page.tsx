"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, User, Video, MessageCircle, Loader2 } from "lucide-react"

interface Appointment {
  id: string
  doctorName: string
  doctorSpecialization: string
  date: Date
  duration: number
  type: "video" | "chat" | "in-person"
  status: "scheduled" | "completed" | "cancelled" | "in-progress"
  notes?: string
}

export default function AppointmentsPage() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Mock appointments data - in real app, fetch from Firestore
    const mockAppointments: Appointment[] = [
      {
        id: "1",
        doctorName: "Dr. Sarah Johnson",
        doctorSpecialization: "Cardiologist",
        date: new Date(Date.now() + 86400000), // Tomorrow
        duration: 30,
        type: "video",
        status: "scheduled",
        notes: "Follow-up consultation for blood pressure monitoring",
      },
      {
        id: "2",
        doctorName: "Dr. Michael Chen",
        doctorSpecialization: "Neurologist",
        date: new Date(Date.now() + 86400000 * 3), // In 3 days
        duration: 45,
        type: "chat",
        status: "scheduled",
      },
      {
        id: "3",
        doctorName: "Dr. Emily Davis",
        doctorSpecialization: "Pediatrician",
        date: new Date(Date.now() - 86400000 * 2), // 2 days ago
        duration: 30,
        type: "video",
        status: "completed",
        notes: "Regular checkup completed successfully",
      },
    ]

    setAppointments(mockAppointments)
  }, [])

  const upcomingAppointments = appointments.filter((apt) => apt.status === "scheduled" && apt.date > new Date())
  const pastAppointments = appointments.filter((apt) => apt.status === "completed" || apt.date < new Date())

  const joinAppointment = (appointmentId: string, type: string) => {
    if (type === "video") {
      toast({
        title: "Joining Video Call",
        description: "Redirecting to video consultation...",
      })
      // In real app, redirect to video call
    } else if (type === "chat") {
      router.push(`/chat/appointment/${appointmentId}`)
    }
  }

  const cancelAppointment = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: "cancelled" as const } : apt)),
    )
    toast({
      title: "Appointment Cancelled",
      description: "Your appointment has been cancelled successfully",
    })
  }

  const rescheduleAppointment = (appointmentId: string) => {
    toast({
      title: "Reschedule Request",
      description: "Reschedule request sent to the doctor",
    })
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
          <h1 className="text-3xl font-bold mb-4">My Appointments</h1>
          <p className="text-muted-foreground mb-6">Manage your medical appointments</p>

          <Button onClick={() => router.push("/doctors")}>
            <Calendar className="h-4 w-4 mr-2" />
            Book New Appointment
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No upcoming appointments</p>
                    <Button className="mt-4" onClick={() => router.push("/doctors")}>
                      Book Your First Appointment
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>{appointment.doctorName}</span>
                            <Badge variant="outline">{appointment.type}</Badge>
                          </CardTitle>
                          <CardDescription>{appointment.doctorSpecialization}</CardDescription>
                        </div>
                        <Badge variant="default">{appointment.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.date.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {appointment.date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            ({appointment.duration} min)
                          </span>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm bg-muted p-3 rounded-lg">{appointment.notes}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => joinAppointment(appointment.id, appointment.type)}>
                          {appointment.type === "video" ? (
                            <Video className="h-4 w-4 mr-1" />
                          ) : (
                            <MessageCircle className="h-4 w-4 mr-1" />
                          )}
                          Join {appointment.type === "video" ? "Video Call" : "Chat"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => rescheduleAppointment(appointment.id)}>
                          Reschedule
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => cancelAppointment(appointment.id)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="space-y-4">
              {pastAppointments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No past appointments</p>
                  </CardContent>
                </Card>
              ) : (
                pastAppointments.map((appointment) => (
                  <Card key={appointment.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>{appointment.doctorName}</span>
                            <Badge variant="outline">{appointment.type}</Badge>
                          </CardTitle>
                          <CardDescription>{appointment.doctorSpecialization}</CardDescription>
                        </div>
                        <Badge variant="secondary">{appointment.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.date.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {appointment.date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            ({appointment.duration} min)
                          </span>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm bg-muted p-3 rounded-lg">{appointment.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Book Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
