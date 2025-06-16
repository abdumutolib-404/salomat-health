import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

const PAYME_MERCHANT_ID = process.env.PAYME_MERCHANT_ID || ""
const PAYME_SECRET_KEY = process.env.PAYME_SECRET_KEY || ""

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planId } = await request.json()

    if (!planId || !["free", "pro"].includes(planId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const user = session.user
    const amount = planId === "pro" ? 99900 : 0 // Amount in tiyin (1 UZS = 100 tiyin)

    // Generate payment URL for Payme
    const account = {
      user_id: user.uid,
      plan: planId,
    }

    const accountBase64 = Buffer.from(JSON.stringify(account)).toString("base64")
    const paymentUrl = `https://checkout.paycom.uz/${PAYME_MERCHANT_ID}?amount=${amount}&account=${accountBase64}`

    return NextResponse.json({
      paymentUrl,
      amount: amount / 100, // Convert to UZS for display
      currency: "UZS",
    })
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
