"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import type { User } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search, Trash2, UserCheck, UserX } from "lucide-react"

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)
        const userData = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as User[]

        setUsers(userData)
        setFilteredUsers(userData)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [searchTerm, roleFilter, users])

  const updateUserRole = async (userId: string, newRole: "patient" | "doctor" | "admin") => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole })
      setUsers((prev) => prev.map((user) => (user.uid === userId ? { ...user, role: newRole } : user)))
      toast({
        title: "Success",
        description: "User role updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    }
  }

  const updateUserStatus = async (userId: string, status: "active" | "inactive") => {
    try {
      await updateDoc(doc(db, "users", userId), { subscriptionStatus: status })
      setUsers((prev) => prev.map((user) => (user.uid === userId ? { ...user, subscriptionStatus: status } : user)))
      toast({
        title: "Success",
        description: "User status updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await deleteDoc(doc(db, "users", userId))
      setUsers((prev) => prev.filter((user) => user.uid !== userId))
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage users, roles, and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="patient">Patients</SelectItem>
              <SelectItem value="doctor">Doctors</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.uid} className="border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium">{user.fullName}</h3>
                    <Badge
                      variant={user.role === "admin" ? "default" : user.role === "doctor" ? "secondary" : "outline"}
                    >
                      {user.role}
                    </Badge>
                    <Badge variant={user.subscriptionStatus === "active" ? "default" : "secondary"}>
                      {user.subscriptionStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Plan: {user.plan} | Tokens: {user.tokenUsedToday || 0} | Joined:{" "}
                    {user.createdAt.toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Select
                    value={user.role}
                    onValueChange={(value: "patient" | "doctor" | "admin") => updateUserRole(user.uid, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateUserStatus(user.uid, user.subscriptionStatus === "active" ? "inactive" : "active")
                    }
                  >
                    {user.subscriptionStatus === "active" ? (
                      <UserX className="h-4 w-4" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => deleteUser(user.uid)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No users found matching your criteria.</div>
        )}
      </CardContent>
    </Card>
  )
}
