"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy } from "firebase/firestore"
import type { Reminder } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Clock, Pill, FileText, Check } from "lucide-react"

export const RemindersManager: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [formData, setFormData] = useState({
    type: "medicine" as "medicine" | "analysis",
    message: "",
    scheduledAt: "",
  })
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "reminders"), where("uid", "==", user.uid), orderBy("scheduledAt", "asc"))

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const reminderData = {
        uid: user.uid,
        type: formData.type,
        message: formData.message,
        scheduledAt: new Date(formData.scheduledAt),
        completed: false,
      }

      if (editingReminder) {
        await updateDoc(doc(db, "reminders", editingReminder.id), reminderData)
        toast({ title: "Success", description: "Reminder updated successfully" })
      } else {
        await addDoc(collection(db, "reminders"), reminderData)
        toast({ title: "Success", description: "Reminder created successfully" })
      }

      setShowForm(false)
      setEditingReminder(null)
      setFormData({ type: "medicine", message: "", scheduledAt: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save reminder",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setFormData({
      type: reminder.type,
      message: reminder.message,
      scheduledAt: reminder.scheduledAt.toISOString().slice(0, 16),
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "reminders", id))
      toast({ title: "Success", description: "Reminder deleted successfully" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive",
      })
    }
  }

  const handleComplete = async (reminder: Reminder) => {
    try {
      await updateDoc(doc(db, "reminders", reminder.id), { completed: !reminder.completed })
      toast({
        title: "Success",
        description: `Reminder marked as ${reminder.completed ? "incomplete" : "complete"}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading reminders...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reminders</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingReminder ? "Edit Reminder" : "Add New Reminder"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "medicine" | "analysis") => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter reminder message"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">{editingReminder ? "Update" : "Create"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingReminder(null)
                    setFormData({ type: "medicine", message: "", scheduledAt: "" })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reminders List */}
      <div className="space-y-4">
        {reminders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No reminders yet. Create your first reminder!</p>
            </CardContent>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id} className={reminder.completed ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {reminder.type === "medicine" ? (
                        <Pill className="h-5 w-5 text-blue-500" />
                      ) : (
                        <FileText className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${reminder.completed ? "line-through" : ""}`}>{reminder.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {reminder.scheduledAt.toLocaleDateString()} at{" "}
                          {reminder.scheduledAt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <Badge variant={reminder.type === "medicine" ? "default" : "secondary"}>{reminder.type}</Badge>
                        {reminder.completed && <Badge variant="outline">Completed</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleComplete(reminder)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(reminder)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(reminder.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
