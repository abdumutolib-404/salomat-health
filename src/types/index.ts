export interface User {
  uid: string
  role: "patient" | "doctor" | "admin"
  fullName: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  age?: number
  profilePicture?: string
  lang: "uz" | "ru" | "en"
  plan: "guest" | "free" | "pro"
  tokenUsedToday: number
  subscriptionStatus: "active" | "inactive" | "canceled"
  emailVerified: boolean
  createdAt: Date
  lastActive?: Date

  // Doctor specific fields
  specialization?: string
  experience?: number
  bio?: string
  consultationFee?: number
  rating?: number
  reviewCount?: number
  patientsCount?: number
  languages?: string[]
  availability?: "available" | "busy" | "offline"

  // Payment fields
  stripeCustomerId?: string
  clickCustomerId?: string

  // Terms acceptance
  termsAccepted: boolean
  privacyAccepted: boolean
}

export interface Chat {
  id: string
  patientId: string
  doctorId: string
  patientName: string
  doctorName: string
  lastMessage?: string
  lastMessageTime?: any
  unreadCount?: { [userId: string]: number }
  createdAt: any
  status: "active" | "archived"
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderRole: "patient" | "doctor"
  content: string
  type: "text" | "image" | "prescription" | "analysis"
  imageUrl?: string
  prescriptionData?: Prescription
  timestamp: any
  read: boolean
}

export interface AIChat {
  id: string
  userId: string
  title: string
  model: string
  messages: AIMessage[]
  createdAt: any
  updatedAt: any
  tokenCount: number
}

export interface AIMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: any
  tokenCount?: number
}

export interface AIModel {
  id: string
  name: string
  provider: string
  baseUrl: string
  isPremium: boolean
  isActive: boolean
  defaultTemperature: number
  systemPrompt: string
  maxTokens?: number
  description?: string
}

export interface Prescription {
  id: string
  doctorId: string
  patientId: string
  doctorName: string
  patientName: string
  medications: Medication[]
  instructions: string
  diagnosis?: string
  createdAt: any
  status: "active" | "completed" | "cancelled"
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  patientName: string
  doctorName: string
  date: any
  duration: number
  type: "video" | "chat" | "in-person"
  status: "pending" | "confirmed" | "completed" | "cancelled"
  fee: number
  notes?: string
  meetingLink?: string
}

export interface Reminder {
  id: string
  userId: string
  type: "medicine" | "analysis" | "appointment"
  title: string
  description: string
  scheduledAt: any
  completed: boolean
  recurring?: {
    frequency: "daily" | "weekly" | "monthly"
    endDate?: any
  }
  medicationData?: {
    name: string
    dosage: string
    times: string[]
  }
}

export interface Review {
  id: string
  doctorId: string
  patientId: string
  patientName: string
  rating: number
  comment: string
  createdAt: any
  appointmentId?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "appointment" | "prescription" | "reminder" | "chat" | "system"
  read: boolean
  createdAt: any
  actionUrl?: string
  data?: any
}

export interface AnalysisUpload {
  id: string
  patientId: string
  doctorId?: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedAt: any
  status: "pending" | "reviewed" | "completed"
  doctorNotes?: string
  aiAnalysis?: string
}

export interface Subscription {
  id: string
  userId: string
  plan: "free" | "pro"
  status: "active" | "inactive" | "canceled"
  startAt: any
  endAt: any
  provider: "click" | "stripe"
  paymentHistory: PaymentRecord[]
}

export interface PaymentRecord {
  id: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  provider: "click" | "stripe"
  createdAt: any
  metadata?: any
}

export interface SystemStats {
  totalUsers: number
  totalDoctors: number
  totalPatients: number
  premiumUsers: number
  totalTokensUsed: number
  totalAppointments: number
  totalPrescriptions: number
  revenue: number
  activeChats: number
}
