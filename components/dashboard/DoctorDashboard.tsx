"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, MessageSquare, Star, Clock, Activity } from "lucide-react"
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Chat, Appointment, Review } from "@/types"

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingReviews: 0,
    todayAppointments: 0,
    unreadMessages: 0,
    averageRating: 0,
    totalReviews: 0,
  })

  useEffect(() => {
    if (!user || user.role !== "doctor") return

    // Subscribe to chats
    const chatsQuery = query(
      collection(db, "chats"),
      where("doctorId", "==", user.uid),
      orderBy("lastMessageTime", "desc"),
      limit(10),
    )

    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      const chatData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Chat[]
      setChats(chatData)

      // Calculate unread messages
      const unreadCount = chatData.reduce((total, chat) => total + (chat.unreadCount?.[user.uid] || 0), 0)
      setStats((prev) => ({ ...prev, unreadMessages: unreadCount }))
    })

    // Subscribe to appointments
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("doctorId", "==", user.uid),
      orderBy("date", "desc"),
      limit(20),
    )

    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      const appointmentData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[]
      setAppointments(appointmentData)

      // Calculate today's appointments
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayAppointments = appointmentData.filter((apt) => {
        const aptDate = apt.date.toDate ? apt.date.toDate() : new Date(apt.date)
        return aptDate >= today && aptDate < tomorrow && apt.status !== "cancelled"
      })

      setStats((prev) => ({
        ...prev,
        todayAppointments: todayAppointments.length,
        totalPatients: new Set(appointmentData.map((apt) => apt.patientId)).size,
      }))
    })

    // Subscribe to reviews
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("doctorId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10),
    )

    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[]
      setReviews(reviewData)

      // Calculate average rating
      if (reviewData.length > 0) {
        const avgRating = reviewData.reduce((sum, review) => sum + review.rating, 0) / reviewData.length
        setStats((prev) => ({
          ...prev,
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviewData.length,
        }))
      }
    })

    return () => {
      unsubscribeChats()
      unsubscribeAppointments()
      unsubscribeReviews()
    }
  }, [user])

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/doctor/${chatId}`)
  }

  const handleViewAllChats = () => {
    router.push("/chat/doctor")
  }

  const handleViewAppointments = () => {
    router.push("/appointments")
  }

  const handleViewReviews = () => {
    router.push("/reviews")
  }

  if (!user || user.role !== "doctor") {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Access denied. Doctor role required.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Active patients</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">Scheduled today</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">New messages</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {stats.averageRating}
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 ml-1" />
            </div>
            <p className="text-xs text-muted-foreground">{stats.totalReviews} reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chats">
            Chats{" "}
            {stats.unreadMessages > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {stats.unreadMessages}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest patient interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    {chats.slice(0, 5).map((chat) => (
                      <div key={chat.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {chat.patientName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{chat.patientName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {chat.lastMessage || "No messages yet"}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {chat.lastMessageTime && new Date(chat.lastMessageTime.toDate()).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {chats.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">No recent activity</div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>Your appointments for today</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    {appointments
                      .filter((apt) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const tomorrow = new Date(today)
                        tomorrow.setDate(tomorrow.getDate() + 1)
                        const aptDate = apt.date.toDate ? apt.date.toDate() : new Date(apt.date)
                        return aptDate >= today && aptDate < tomorrow && apt.status !== "cancelled"
                      })
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex-shrink-0">
                            <Badge
                              variant={
                                appointment.status === "confirmed"
                                  ? "default"
                                  : appointment.status === "pending"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{appointment.patientName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(appointment.date.toDate()).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              • {appointment.type}
                            </p>
                          </div>
                          <div className="text-sm font-medium">${appointment.fee}</div>
                        </div>
                      ))}
                    {appointments.filter((apt) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const tomorrow = new Date(today)
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      const aptDate = apt.date.toDate ? apt.date.toDate() : new Date(apt.date)
                      return aptDate >= today && aptDate < tomorrow && apt.status !== "cancelled"
                    }).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">No appointments scheduled for today</div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chats" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Patient Chats</CardTitle>
                <CardDescription>Manage conversations with your patients</CardDescription>
              </div>
              <Button onClick={handleViewAllChats}>View All</Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleChatClick(chat.id)}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {chat.patientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{chat.patientName}</p>
                          <div className="flex items-center space-x-2">
                            {chat.unreadCount?.[user.uid] > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                                {chat.unreadCount[user.uid]}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {chat.lastMessageTime && new Date(chat.lastMessageTime.toDate()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {chats.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No patient chats yet. Patients will appear here when they start conversations.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Appointments</CardTitle>
                <CardDescription>Manage your scheduled appointments</CardDescription>
              </div>
              <Button onClick={handleViewAppointments}>View All</Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {appointments.slice(0, 10).map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-4 p-4 rounded-lg border">
                      <div className="flex-shrink-0">
                        <Badge
                          variant={
                            appointment.status === "confirmed"
                              ? "default"
                              : appointment.status === "pending"
                                ? "secondary"
                                : appointment.status === "completed"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                      <Avatar>
                        <AvatarFallback>
                          {appointment.patientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{appointment.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.date.toDate()).toLocaleDateString()} at{" "}
                          {new Date(appointment.date.toDate()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.type} • {appointment.duration} min • ${appointment.fee}
                        </p>
                      </div>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No appointments yet. Patients can book appointments with you.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Patient Reviews</CardTitle>
                <CardDescription>See what patients say about your service</CardDescription>
              </div>
              <Button onClick={handleViewReviews}>View All</Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {review.patientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{review.patientName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt.toDate()).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No reviews yet. Reviews will appear here after patient consultations.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
