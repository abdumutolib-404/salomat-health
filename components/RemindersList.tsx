"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import type { Reminder } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Pill, FileText } from "lucide-react"

export const RemindersList: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "reminders"),
      where("uid", "==", user.uid),
      where("completed", "==", false),
      orderBy("scheduledAt", "asc"),
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reminderData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        scheduledAt: doc.data().scheduledAt.toDate(),
      })) as Reminder[]

      setReminders(reminderData)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  if (loading) {
    return <div className="text-center py-4">Loading reminders...</div>
  }

  if (reminders.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No upcoming reminders</div>
  }

  return (
    <div className="space-y-3">
      {reminders.slice(0, 3).map((reminder) => (
        <Card key={reminder.id} className="p-3">
          <CardContent className="p-0">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {reminder.type === "medicine" ? (
                  <Pill className="h-4 w-4 text-blue-500" />
                ) : (
                  <FileText className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{reminder.message}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {reminder.scheduledAt.toLocaleDateString()} at{" "}
                    {reminder.scheduledAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <Badge variant={reminder.type === "medicine" ? "default" : "secondary"}>{reminder.type}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
      {reminders.length > 3 && (
        <p className="text-xs text-muted-foreground text-center">+{reminders.length - 3} more reminders</p>
      )}
    </div>
  )
}
