import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { sanitizeInput } from "@/lib/security"

// Payme configuration
const PAYME_MERCHANT_ID = process.env.PAYME_MERCHANT_ID || ""
const PAYME_SECRET_KEY = process.env.PAYME_SECRET_KEY || ""

interface PaymeRequest {
  method: string
  params: {
    id?: string
    account?: {
      user_id: string
      plan: string
    }
    amount?: number
    time?: number
    reason?: number
  }
  id: number
}

interface PaymeResponse {
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
  id: number
}

// Rate limiting for payment endpoints
const paymentAttempts = new Map<string, { count: number; lastAttempt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const attempts = paymentAttempts.get(ip)

  if (!attempts) {
    paymentAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  // Reset if more than 1 hour passed
  if (now - attempts.lastAttempt > 3600000) {
    paymentAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  // Allow max 10 attempts per hour
  if (attempts.count >= 10) {
    return false
  }

  attempts.count++
  attempts.lastAttempt = now
  return true
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: { code: -32700, message: "Too many requests" } }, { status: 429 })
    }

    const body: PaymeRequest = await request.json()

    // Validate request structure
    if (!body.method || typeof body.id !== "number") {
      return NextResponse.json({
        error: { code: -32600, message: "Invalid Request" },
        id: body.id || 0,
      })
    }

    const response: PaymeResponse = { id: body.id }

    switch (body.method) {
      case "CheckPerformTransaction":
        return await handleCheckPerformTransaction(body, response)

      case "CreateTransaction":
        return await handleCreateTransaction(body, response)

      case "PerformTransaction":
        return await handlePerformTransaction(body, response)

      case "CancelTransaction":
        return await handleCancelTransaction(body, response)

      case "CheckTransaction":
        return await handleCheckTransaction(body, response)

      default:
        response.error = { code: -32601, message: "Method not found" }
        return NextResponse.json(response)
    }
  } catch (error) {
    console.error("Payme webhook error:", error)
    return NextResponse.json({ error: { code: -32603, message: "Internal error" } }, { status: 500 })
  }
}

async function handleCheckPerformTransaction(body: PaymeRequest, response: PaymeResponse) {
  const { account, amount } = body.params || {}

  if (!account?.user_id || !account?.plan || !amount) {
    response.error = { code: -31001, message: "Invalid account" }
    return NextResponse.json(response)
  }

  // Validate user exists
  const userDoc = await getDoc(doc(db, "users", sanitizeInput(account.user_id)))
  if (!userDoc.exists()) {
    response.error = { code: -31050, message: "User not found" }
    return NextResponse.json(response)
  }

  // Validate amount based on plan
  const expectedAmount = account.plan === "pro" ? 999 : 0 // $9.99 in cents
  if (amount !== expectedAmount) {
    response.error = { code: -31001, message: "Invalid amount" }
    return NextResponse.json(response)
  }

  response.result = { allow: true }
  return NextResponse.json(response)
}

async function handleCreateTransaction(body: PaymeRequest, response: PaymeResponse) {
  const { id, account, amount, time } = body.params || {}

  if (!id || !account?.user_id || !amount || !time) {
    response.error = { code: -31001, message: "Invalid parameters" }
    return NextResponse.json(response)
  }

  try {
    // Create transaction record
    await setDoc(doc(db, "transactions", id), {
      id: sanitizeInput(id),
      userId: sanitizeInput(account.user_id),
      plan: sanitizeInput(account.plan),
      amount,
      state: 1, // Created
      createdAt: new Date(time),
      provider: "payme",
    })

    response.result = {
      create_time: time,
      transaction: id,
      state: 1,
    }
    return NextResponse.json(response)
  } catch (error) {
    response.error = { code: -31008, message: "Unable to create transaction" }
    return NextResponse.json(response)
  }
}

async function handlePerformTransaction(body: PaymeRequest, response: PaymeResponse) {
  const { id } = body.params || {}

  if (!id) {
    response.error = { code: -31001, message: "Invalid transaction ID" }
    return NextResponse.json(response)
  }

  try {
    const transactionDoc = await getDoc(doc(db, "transactions", id))
    if (!transactionDoc.exists()) {
      response.error = { code: -31003, message: "Transaction not found" }
      return NextResponse.json(response)
    }

    const transaction = transactionDoc.data()

    // Update transaction state
    await updateDoc(doc(db, "transactions", id), {
      state: 2, // Completed
      performedAt: new Date(),
    })

    // Update user subscription
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1) // 1 month subscription

    await updateDoc(doc(db, "users", transaction.userId), {
      plan: transaction.plan,
      subscriptionStatus: "active",
    })

    // Create subscription record
    await setDoc(doc(db, "subscriptions", transaction.userId), {
      uid: transaction.userId,
      status: "active",
      plan: transaction.plan,
      startAt: new Date(),
      endAt: endDate,
      provider: "payme",
      paymentHistory: [
        {
          paymentId: id,
          amount: transaction.amount / 100, // Convert from cents
          date: new Date(),
          status: "completed",
        },
      ],
    })

    response.result = {
      perform_time: Date.now(),
      transaction: id,
      state: 2,
    }
    return NextResponse.json(response)
  } catch (error) {
    response.error = { code: -31008, message: "Unable to perform transaction" }
    return NextResponse.json(response)
  }
}

async function handleCancelTransaction(body: PaymeRequest, response: PaymeResponse) {
  const { id, reason } = body.params || {}

  if (!id) {
    response.error = { code: -31001, message: "Invalid transaction ID" }
    return NextResponse.json(response)
  }

  try {
    const transactionDoc = await getDoc(doc(db, "transactions", id))
    if (!transactionDoc.exists()) {
      response.error = { code: -31003, message: "Transaction not found" }
      return NextResponse.json(response)
    }

    const transaction = transactionDoc.data()

    // Update transaction state
    await updateDoc(doc(db, "transactions", id), {
      state: transaction.state === 1 ? -1 : -2, // Cancelled
      cancelledAt: new Date(),
      cancelReason: reason,
    })

    // If transaction was completed, revert user subscription
    if (transaction.state === 2) {
      await updateDoc(doc(db, "users", transaction.userId), {
        plan: "free",
        subscriptionStatus: "canceled",
      })
    }

    response.result = {
      cancel_time: Date.now(),
      transaction: id,
      state: transaction.state === 1 ? -1 : -2,
    }
    return NextResponse.json(response)
  } catch (error) {
    response.error = { code: -31008, message: "Unable to cancel transaction" }
    return NextResponse.json(response)
  }
}

async function handleCheckTransaction(body: PaymeRequest, response: PaymeResponse) {
  const { id } = body.params || {}

  if (!id) {
    response.error = { code: -31001, message: "Invalid transaction ID" }
    return NextResponse.json(response)
  }

  try {
    const transactionDoc = await getDoc(doc(db, "transactions", id))
    if (!transactionDoc.exists()) {
      response.error = { code: -31003, message: "Transaction not found" }
      return NextResponse.json(response)
    }

    const transaction = transactionDoc.data()

    response.result = {
      create_time: transaction.createdAt.getTime(),
      perform_time: transaction.performedAt?.getTime() || 0,
      cancel_time: transaction.cancelledAt?.getTime() || 0,
      transaction: id,
      state: transaction.state,
      reason: transaction.cancelReason || null,
    }
    return NextResponse.json(response)
  } catch (error) {
    response.error = { code: -31008, message: "Unable to check transaction" }
    return NextResponse.json(response)
  }
}
