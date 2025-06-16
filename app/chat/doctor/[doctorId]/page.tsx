"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Send, User, Loader2 } from "lucide-react"

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  type: "text" | "prescription" | "analysis"
}

interface Doctor {
  id: string
  fullName: string
  specialization: string
  availability: "available" | "busy" | "offline"
}

export default function DoctorChatPage({ params }: { params: { doctorId: string } }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Mock doctor data - in real app, fetch from Firestore
    setDoctor({
      id: params.doctorId,
      fullName: "Dr. Sarah Johnson",
      specialization: "Cardiologist",
      availability: "available",
    })

    // Mock messages - in real app, fetch from Firestore
    setMessages([
      {
        id: "1",
        senderId: params.doctorId,
        senderName: "Dr. Sarah Johnson",
        content: "Hello! How can I help you today?",
        timestamp: new Date(Date.now() - 300000),
        type: "text",
      },
    ])
  }, [user, router, params.doctorId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading || !user || !doctor) return

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.uid,
      senderName: user.fullName,
      content: input.trim(),
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setLoading(true)

    // Simulate doctor response
    setTimeout(() => {
      const doctorResponse: Message = {
        id: (Date.now() + 1).toString(),
        senderId: doctor.id,
        senderName: doctor.fullName,
        content: "Thank you for your message. I'll review your case and get back to you shortly.",
        timestamp: new Date(),
        type: "text",
      }
      setMessages((prev) => [...prev, doctorResponse])
      setLoading(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!user || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>
                  {doctor.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{doctor.fullName}</span>
                  <Badge variant={doctor.availability === "available" ? "default" : "secondary"}>
                    {doctor.availability}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.senderId === user.uid ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.senderId !== user.uid && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {message.senderName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.senderId === user.uid ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {message.senderId === user.uid && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {doctor.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={loading || doctor.availability === "offline"}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={loading || !input.trim() || doctor.availability === "offline"}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
