"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { storage, db } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { collection, addDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { X, Upload, Loader2 } from "lucide-react"

interface AnalysisUploadProps {
  onClose: () => void
}

export const AnalysisUpload: React.FC<AnalysisUploadProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or image file",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        })
        return
      }

      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file || !user) return

    setUploading(true)
    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `analyses/${user.uid}/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      // Save metadata to Firestore
      await addDoc(collection(db, "analyses"), {
        patientId: user.uid,
        fileName: file.name,
        fileUrl: downloadURL,
        uploadedAt: new Date(),
        doctorReviewed: false,
      })

      toast({
        title: "Success",
        description: "Analysis uploaded successfully",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload analysis",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upload Analysis</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input id="file" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
            <p className="text-xs text-muted-foreground">Supported formats: PDF, JPG, PNG (max 10MB)</p>
          </div>

          {file && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span className="text-sm">{file.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || uploading} className="flex-1">
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
