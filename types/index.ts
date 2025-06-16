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
  stripeCustomerId?: string
  clickCustomerId?: string
  emailVerified: boolean
  specialization?: string // for doctors
  experience?: number // for doctors
  bio?: string // for doctors
  languages?: string[] // for doctors
  consultationFee?: number // for doctors
  rating?: number // for doctors
  reviewCount?: number // for doctors
  patientsCount?: number // for doctors
  createdAt: Date
  lastActive?: Date
  termsAccepted: boolean
  privacyAccepted: boolean
}

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderRole: "patient" | "doctor"
  content: string
  type: "text" | "image" | "prescription" | "analysis"
  imageUrl?: string
  prescriptionData?: PrescriptionData
  tokenCount?: number
  timestamp: Date
  read: boolean
  edited?: boolean
  editedAt?: Date
}

export interface Chat {
  id: string
  participants: string[] // [patientId, doctorId]
  patientId: string
  doctorId: string
  patientName: string
  doctorName: string
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: { [userId: string]: number }
  createdAt: Date
  status: "active" | "archived"
}

export interface PrescriptionData {
  id: string
  patientId: string
  doctorId: string
  doctorName: string
  medications: Medication[]
  instructions: string
  prescribedAt: Date
  status: "active" | "completed" | "cancelled"
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
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
  tokenCost: number
}

export interface Subscription {
  uid: string
  status: "active" | "inactive" | "canceled"
  plan: string
  startAt: Date
  endAt: Date
  provider: "click" | "stripe"
  paymentHistory: PaymentRecord[]
}

export interface PaymentRecord {
  paymentId: string
  amount: number
  date: Date
  status: "completed" | "pending" | "failed"
}

export interface Reminder {
  id: string
  uid: string
  type: "medicine" | "analysis" | "appointment"
  title: string
  message: string
  scheduledAt: Date
  completed: boolean
  recurring?: {
    frequency: "daily" | "weekly" | "monthly"
    endDate?: Date
  }
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  patientName: string
  doctorName: string
  date: Date
  duration: number
  type: "video" | "chat" | "in-person"
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes?: string
  fee: number
  meetingLink?: string
}

export interface Review {
  id: string
  patientId: string
  doctorId: string
  patientName: string
  rating: number
  comment: string
  createdAt: Date
  appointmentId?: string
}

export interface Notification {
  id: string
  userId: string
  type: "appointment" | "message" | "prescription" | "reminder" | "system"
  title: string
  message: string
  read: boolean
  createdAt: Date
  actionUrl?: string
  data?: any
}

export interface AnalysisUpload {
  id: string
  patientId: string
  fileName: string
  fileUrl: string
  uploadedAt: Date
  doctorReviewed: boolean
  doctorNotes?: string
  doctorId?: string
}

export interface OTPVerification {
  email: string
  code: string
  type: "email_verification" | "password_reset"
  expiresAt: Date
  attempts: number
}
