// Firestore Security Rules for Salomat.health
// These rules ensure proper access control based on user roles

const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow admins to read all users
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Chat messages - users can only access their own chats
    match /users/{userId}/chats/{chatId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Analysis uploads - patients can upload, doctors can read assigned patients
    match /analyses/{analysisId} {
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.patientId;
      
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.patientId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['doctor', 'admin'];
    }
    
    // AI Models - only admins can modify
    match /models/{modelId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Subscriptions - users can read their own, admins can read all
    match /subscriptions/{userId} {
      allow read: if request.auth != null && (
        request.auth.uid == userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Reminders - users can manage their own
    match /reminders/{reminderId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.uid;
    }
    
    // Logs - only admins can read
    match /logs/{logId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      allow create: if request.auth != null;
    }
  }
}
`

console.log("Firestore Security Rules:")
console.log(firestoreRules)
console.log("\nDeploy these rules using: firebase deploy --only firestore:rules")
