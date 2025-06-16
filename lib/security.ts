import crypto from "crypto"

// Input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return ""

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential XSS characters
    .replace(/['";]/g, "") // Remove SQL injection characters
    .slice(0, 1000) // Limit length
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Password validation
export function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)
}

// Generate secure OTP
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

// Hash sensitive data
export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

// CSRF token generation
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Validate file uploads
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type" }
  }

  if (file.size > maxSize) {
    return { valid: false, error: "File too large" }
  }

  return { valid: true }
}

// Content Security Policy
export const CSP_HEADER = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.openrouter.ai https://*.firebase.com https://*.googleapis.com;
  media-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s+/g, " ")
  .trim()

// Rate limiting for client-side
export class ClientRateLimit {
  private requests: Map<string, number[]> = new Map()

  isAllowed(key: string, windowMs: number, maxRequests: number): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < windowMs)

    if (validRequests.length >= maxRequests) {
      return false
    }

    validRequests.push(now)
    this.requests.set(key, validRequests)
    return true
  }
}

export const clientRateLimit = new ClientRateLimit()
