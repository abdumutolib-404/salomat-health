// Complete Firebase setup script for Salomat.health
// Run this script to set up your Firebase project

console.log("🔥 Firebase Setup for Salomat.health")
console.log("=====================================")

// 1. Firebase Configuration
console.log("\n1. Firebase Configuration")
console.log("Add this to your .env.local file:")
console.log(`
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
JWT_SECRET=your_super_secret_jwt_key_here
PAYME_MERCHANT_ID=your_payme_merchant_id
PAYME_SECRET_KEY=your_payme_secret_key
`)

// 2. Firestore Collections Structure
console.log("\n2. Firestore Collections Structure")
console.log("The following collections will be created automatically:")

const collections = {
  users: {
    description: "User profiles (patients, doctors, admins)",
    fields: [
      "uid",
      "role",
      "fullName",
      "firstName",
      "lastName",
      "email",
      "phone",
      "age",
      "profilePicture",
      "lang",
      "plan",
      "tokenUsedToday",
      "subscriptionStatus",
      "emailVerified",
      "specialization",
      "experience",
      "bio",
      "languages",
      "consultationFee",
      "rating",
      "reviewCount",
      "patientsCount",
      "createdAt",
      "lastActive",
      "termsAccepted",
      "privacyAccepted",
    ],
  },
  chats: {
    description: "Chat conversations between patients and doctors",
    fields: [
      "id",
      "participants",
      "patientId",
      "doctorId",
      "patientName",
      "doctorName",
      "lastMessage",
      "lastMessageTime",
      "unreadCount",
      "createdAt",
      "status",
    ],
  },
  messages: {
    description: "Individual chat messages",
    fields: [
      "id",
      "chatId",
      "senderId",
      "senderName",
      "senderRole",
      "content",
      "type",
      "imageUrl",
      "prescriptionData",
      "tokenCount",
      "timestamp",
      "read",
      "edited",
      "editedAt",
    ],
  },
  appointments: {
    description: "Medical appointments",
    fields: [
      "id",
      "patientId",
      "doctorId",
      "patientName",
      "doctorName",
      "date",
      "duration",
      "type",
      "status",
      "notes",
      "fee",
      "meetingLink",
    ],
  },
  prescriptions: {
    description: "Medical prescriptions",
    fields: ["id", "patientId", "doctorId", "doctorName", "medications", "instructions", "prescribedAt", "status"],
  },
  reviews: {
    description: "Doctor reviews by patients",
    fields: ["id", "patientId", "doctorId", "patientName", "rating", "comment", "createdAt", "appointmentId"],
  },
  notifications: {
    description: "User notifications",
    fields: ["id", "userId", "type", "title", "message", "read", "createdAt", "actionUrl", "data"],
  },
  subscriptions: {
    description: "User subscription records",
    fields: ["uid", "status", "plan", "startAt", "endAt", "provider", "paymentHistory"],
  },
  transactions: {
    description: "Payment transactions",
    fields: [
      "id",
      "userId",
      "plan",
      "amount",
      "state",
      "createdAt",
      "performedAt",
      "cancelledAt",
      "cancelReason",
      "provider",
    ],
  },
  reminders: {
    description: "User reminders",
    fields: ["id", "uid", "type", "title", "message", "scheduledAt", "completed", "recurring"],
  },
  analyses: {
    description: "Medical analysis uploads",
    fields: ["id", "patientId", "fileName", "fileUrl", "uploadedAt", "doctorReviewed", "doctorNotes", "doctorId"],
  },
  models: {
    description: "AI model configurations",
    fields: [
      "id",
      "name",
      "provider",
      "baseUrl",
      "isPremium",
      "isActive",
      "defaultTemperature",
      "systemPrompt",
      "tokenCost",
    ],
  },
  logs: {
    description: "System activity logs",
    fields: ["uid", "model", "tokenCount", "promptExcerpt", "createdAt", "type", "details"],
  },
}

Object.entries(collections).forEach(([name, info]) => {
  console.log(`\n📁 ${name}`)
  console.log(`   ${info.description}`)
  console.log(`   Fields: ${info.fields.join(", ")}`)
})

// 3. Security Rules
console.log("\n3. Firestore Security Rules")
console.log("Deploy these rules using: firebase deploy --only firestore:rules")

const securityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isAdmin() {
      return getUserRole() == 'admin';
    }
    
    function isDoctor() {
      return getUserRole() == 'doctor';
    }
    
    function isPatient() {
      return getUserRole() == 'patient';
    }

    // Users collection
    match /users/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
      allow read: if isAuthenticated() && (isAdmin() || isDoctor());
    }
    
    // Chats collection
    match /chats/{chatId} {
      allow read, write: if isAuthenticated() && 
        (resource.data.patientId == request.auth.uid || 
         resource.data.doctorId == request.auth.uid ||
         isAdmin());
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.senderId;
      allow update: if isAuthenticated() && 
        request.auth.uid == resource.data.senderId;
    }
    
    // Appointments collection
    match /appointments/{appointmentId} {
      allow read, write: if isAuthenticated() && 
        (resource.data.patientId == request.auth.uid || 
         resource.data.doctorId == request.auth.uid ||
         isAdmin());
    }
    
    // Prescriptions collection
    match /prescriptions/{prescriptionId} {
      allow read: if isAuthenticated() && 
        (resource.data.patientId == request.auth.uid || 
         resource.data.doctorId == request.auth.uid ||
         isAdmin());
      allow create, update: if isAuthenticated() && 
        (isDoctor() || isAdmin());
    }
    
    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isPatient() &&
        request.auth.uid == request.resource.data.patientId;
      allow update, delete: if isAuthenticated() && 
        (request.auth.uid == resource.data.patientId || isAdmin());
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read, write: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
    }
    
    // Subscriptions collection
    match /subscriptions/{userId} {
      allow read: if isAuthenticated() && 
        (isOwner(userId) || isAdmin());
      allow write: if isAuthenticated() && isAdmin();
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create, update: if isAuthenticated();
    }
    
    // Reminders collection
    match /reminders/{reminderId} {
      allow read, write: if isAuthenticated() && 
        resource.data.uid == request.auth.uid;
    }
    
    // Analyses collection
    match /analyses/{analysisId} {
      allow read: if isAuthenticated() && 
        (resource.data.patientId == request.auth.uid || 
         isDoctor() || isAdmin());
      allow create: if isAuthenticated() && isPatient() &&
        request.auth.uid == request.resource.data.patientId;
      allow update: if isAuthenticated() && 
        (isDoctor() || isAdmin());
    }
    
    // Models collection
    match /models/{modelId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isAdmin();
    }
    
    // Logs collection
    match /logs/{logId} {
      allow read: if isAuthenticated() && isAdmin();
      allow create: if isAuthenticated();
    }
  }
}
`

console.log(securityRules)

// 4. Cloud Functions
console.log("\n4. Cloud Functions Setup")
console.log("Install Firebase CLI: npm install -g firebase-tools")
console.log("Initialize functions: firebase init functions")
console.log("Deploy functions: firebase deploy --only functions")

// 5. Storage Rules
console.log("\n5. Firebase Storage Rules")
console.log("Deploy these rules using: firebase deploy --only storage")

const storageRules = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    
    // Medical analyses
    match /analyses/{userId}/{allPaths=**} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/(default)/documents/users/$(request.auth.uid)).data.role in ['doctor', 'admin']);
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 10 * 1024 * 1024;
    }
    
    // Chat images
    match /chat-images/{chatId}/{allPaths=**} {
      allow read, write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
`

console.log(storageRules)

// 6. Environment Setup
console.log("\n6. Environment Setup")
console.log("Create these files in your project root:")

console.log("\n📄 .env.local (for development)")
console.log("📄 .env.production (for production)")
console.log("📄 firebase.json (Firebase configuration)")
console.log("📄 .firebaserc (Firebase project configuration)")

// 7. Initial Data
console.log("\n7. Initial Data Setup")
console.log("Run this script to add initial AI models and admin user:")

const initialData = `
// Add to your Firebase console or run via admin SDK
const initialModels = [
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    baseUrl: "https://api.openrouter.ai/api/v1/chat/completions",
    isPremium: false,
    isActive: true,
    defaultTemperature: 0.7,
    systemPrompt: "You are a helpful medical AI assistant. Provide general health information but always recommend consulting with healthcare professionals for specific medical advice.",
    tokenCost: 0.001
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "openai", 
    baseUrl: "https://api.openrouter.ai/api/v1/chat/completions",
    isPremium: true,
    isActive: true,
    defaultTemperature: 0.7,
    systemPrompt: "You are an advanced medical AI assistant. Provide detailed health information while emphasizing the importance of professional medical consultation.",
    tokenCost: 0.03
  }
];

// Add admin user (replace with your email)
const adminUser = {
  role: "admin",
  fullName: "System Administrator",
  firstName: "System",
  lastName: "Administrator", 
  email: "admin@salomat.health",
  lang: "en",
  plan: "pro",
  tokenUsedToday: 0,
  subscriptionStatus: "active",
  emailVerified: true,
  createdAt: new Date(),
  termsAccepted: true,
  privacyAccepted: true
};
`

console.log(initialData)

console.log("\n✅ Firebase setup complete!")
console.log("Next steps:")
console.log("1. Create a Firebase project at https://console.firebase.google.com")
console.log("2. Enable Authentication, Firestore, and Storage")
console.log("3. Add your configuration to .env.local")
console.log("4. Deploy security rules")
console.log("5. Add initial data")
console.log("6. Test your application")
