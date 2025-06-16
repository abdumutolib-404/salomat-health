import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySession } from "@/lib/auth"
import { CSP_HEADER } from "@/lib/security"

// Rate limiting storage
const rateLimit = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown"
  return ip
}

function checkRateLimit(key: string, windowMs: number, maxRequests: number): boolean {
  const now = Date.now()
  const record = rateLimit.get(key)

  if (!record || now > record.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apply rate limiting
  const rateLimitKey = getRateLimitKey(request)

  // Different rate limits for different endpoints
  if (pathname.startsWith("/api/")) {
    if (!checkRateLimit(rateLimitKey, 60000, 100)) {
      // 100 requests per minute for API
      return new NextResponse("Too Many Requests", { status: 429 })
    }
  } else if (pathname.startsWith("/auth/")) {
    if (!checkRateLimit(rateLimitKey, 900000, 10)) {
      // 10 requests per 15 minutes for auth
      return new NextResponse("Too Many Requests", { status: 429 })
    }
  } else {
    if (!checkRateLimit(rateLimitKey, 60000, 200)) {
      // 200 requests per minute for general pages
      return new NextResponse("Too Many Requests", { status: 429 })
    }
  }

  // Security headers
  const response = NextResponse.next()

  // Content Security Policy
  response.headers.set("Content-Security-Policy", CSP_HEADER)

  // Other security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // HSTS for production
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }

  // Protected routes
  const protectedRoutes = ["/dashboard", "/chat", "/appointments", "/prescriptions", "/profile", "/admin"]
  const authRoutes = ["/auth/login", "/auth/signup"]

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const session = await verifySession(request)

    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Admin-only routes
    if (pathname.startsWith("/admin") && session.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    const session = await verifySession(request)

    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
