import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { OpenAI } from "openai"
import Stripe from "stripe"

admin.initializeApp()

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
  baseURL: "https://openrouter.ai/api/v1",
})

const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: "2023-10-16",
})

// AI Chat Function
export const callAIModel = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated")
  }

  const { prompt, modelId, temperature = 0.7 } = data
  const userId = context.auth.uid

  try {
    // Get user data
    const userDoc = await admin.firestore().doc(`users/${userId}`).get()
    const userData = userDoc.data()

    if (!userData) {
      throw new functions.https.HttpsError("not-found", "User not found")
    }

    // Get model configuration
    const modelDoc = await admin.firestore().doc(`models/${modelId}`).get()
    const modelData = modelDoc.data()

    if (!modelData || !modelData.isActive) {
      throw new functions.https.HttpsError("not-found", "Model not found or inactive")
    }

    // Check if user can use premium models
    if (modelData.isPremium && userData.plan !== "pro") {
      throw new functions.https.HttpsError("permission-denied", "Premium model requires Pro subscription")
    }

    // Check token limits for free users
    if (userData.plan === "free" && userData.tokenUsedToday >= 200000) {
      throw new functions.https.HttpsError("resource-exhausted", "Daily token limit exceeded")
    }

    // Call OpenRouter API
    const response = await openai.chat.completions.create({
      model: modelData.name,
      messages: [
        { role: "system", content: modelData.systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature,
      max_tokens: modelData.maxTokens || 2000,
      stream: false,
    })

    const aiResponse = response.choices[0]?.message?.content || "No response generated"
    const tokenCount = response.usage?.total_tokens || 0

    // Update user token usage
    await admin
      .firestore()
      .doc(`users/${userId}`)
      .update({
        tokenUsedToday: admin.firestore.FieldValue.increment(tokenCount),
      })

    // Log the interaction
    await admin
      .firestore()
      .collection("logs")
      .add({
        userId,
        model: modelId,
        tokenCount,
        promptExcerpt: prompt.substring(0, 100),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })

    return {
      response: aiResponse,
      tokenCount,
      tokensRemaining: userData.plan === "pro" ? -1 : Math.max(0, 200000 - (userData.tokenUsedToday + tokenCount)),
    }
  } catch (error) {
    console.error("AI Model Error:", error)
    throw new functions.https.HttpsError("internal", "Failed to process AI request")
  }
})

// Reset daily token usage
export const resetTokenUsage = functions.pubsub.schedule("0 0 * * *").onRun(async () => {
  const batch = admin.firestore().batch()
  const usersSnapshot = await admin.firestore().collection("users").get()

  usersSnapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { tokenUsedToday: 0 })
  })

  await batch.commit()
  console.log("Daily token usage reset completed")
})

// Create Stripe checkout session
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated")
  }

  const { priceId, successUrl, cancelUrl } = data
  const userId = context.auth.uid

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: context.auth.token.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
    })

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error("Stripe Error:", error)
    throw new functions.https.HttpsError("internal", "Failed to create checkout session")
  }
})

// Handle Stripe webhooks
export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"] as string
  const endpointSecret = functions.config().stripe.webhook_secret

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    res.status(400).send("Webhook signature verification failed")
    return
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (userId) {
          await admin.firestore().doc(`users/${userId}`).update({
            plan: "pro",
            subscriptionStatus: "active",
            stripeCustomerId: session.customer,
          })

          await admin
            .firestore()
            .collection("subscriptions")
            .doc(userId)
            .set(
              {
                userId,
                plan: "pro",
                status: "active",
                provider: "stripe",
                startAt: admin.firestore.FieldValue.serverTimestamp(),
                paymentHistory: admin.firestore.FieldValue.arrayUnion({
                  paymentId: session.payment_intent,
                  amount: session.amount_total,
                  currency: session.currency,
                  status: "completed",
                  createdAt: admin.firestore.FieldValue.serverTimestamp(),
                }),
              },
              { merge: true },
            )
        }
        break

      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const userQuery = await admin.firestore().collection("users").where("stripeCustomerId", "==", customerId).get()

        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0]
          await userDoc.ref.update({
            plan: "free",
            subscriptionStatus: "canceled",
          })

          await admin.firestore().doc(`subscriptions/${userDoc.id}`).update({
            status: "canceled",
            endAt: admin.firestore.FieldValue.serverTimestamp(),
          })
        }
        break
    }

    res.status(200).send("Webhook handled successfully")
  } catch (error) {
    console.error("Webhook handling error:", error)
    res.status(500).send("Webhook handling failed")
  }
})

// Send email verification OTP
export const sendEmailVerificationOTP = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated")
  }

  const { email } = data
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  try {
    // Store OTP in Firestore with expiration
    await admin
      .firestore()
      .collection("otps")
      .doc(email)
      .set({
        otp,
        type: "email_verification",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      })

    // Send email (implement with your email service)
    // For now, just log the OTP
    console.log(`Email verification OTP for ${email}: ${otp}`)

    return { success: true, message: "OTP sent successfully" }
  } catch (error) {
    console.error("Send OTP Error:", error)
    throw new functions.https.HttpsError("internal", "Failed to send OTP")
  }
})

// Verify email OTP
export const verifyEmailOTP = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated")
  }

  const { email, otp } = data
  const userId = context.auth.uid

  try {
    const otpDoc = await admin.firestore().doc(`otps/${email}`).get()
    const otpData = otpDoc.data()

    if (!otpData || otpData.otp !== otp) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid OTP")
    }

    if (otpData.expiresAt.toDate() < new Date()) {
      throw new functions.https.HttpsError("deadline-exceeded", "OTP expired")
    }

    // Update user email verification status
    await admin.firestore().doc(`users/${userId}`).update({
      emailVerified: true,
    })

    // Delete used OTP
    await admin.firestore().doc(`otps/${email}`).delete()

    return { success: true, message: "Email verified successfully" }
  } catch (error) {
    console.error("Verify OTP Error:", error)
    throw new functions.https.HttpsError("internal", "Failed to verify OTP")
  }
})

// Send password reset OTP
export const sendPasswordResetOTP = functions.https.onCall(async (data) => {
  const { email } = data
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  try {
    // Check if user exists
    const userQuery = await admin.firestore().collection("users").where("email", "==", email).get()

    if (userQuery.empty) {
      throw new functions.https.HttpsError("not-found", "User not found")
    }

    // Store OTP
    await admin
      .firestore()
      .collection("otps")
      .doc(email)
      .set({
        otp,
        type: "password_reset",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      })

    // Send email (implement with your email service)
    console.log(`Password reset OTP for ${email}: ${otp}`)

    return { success: true, message: "Password reset OTP sent successfully" }
  } catch (error) {
    console.error("Send Password Reset OTP Error:", error)
    throw new functions.https.HttpsError("internal", "Failed to send password reset OTP")
  }
})

// Handle Click payment webhook
export const handleClickWebhook = functions.https.onRequest(async (req, res) => {
  const { method, params } = req.body

  try {
    switch (method) {
      case "check_transaction":
        // Verify transaction exists
        const transactionId = params.id
        const transactionDoc = await admin.firestore().doc(`transactions/${transactionId}`).get()

        if (!transactionDoc.exists) {
          res.json({
            error: -31050,
            error_note: "Transaction not found",
          })
          return
        }

        const transactionData = transactionDoc.data()
        res.json({
          result: {
            create_time: transactionData?.createdAt?.toMillis() || Date.now(),
            perform_time: transactionData?.performedAt?.toMillis() || 0,
            cancel_time: transactionData?.canceledAt?.toMillis() || 0,
            transaction: transactionId,
            state: transactionData?.state || 1,
          },
        })
        break

      case "create_transaction":
        // Create new transaction
        const { id, time, amount, account } = params
        const userId = account.userId

        await admin
          .firestore()
          .doc(`transactions/${id}`)
          .set({
            id,
            userId,
            amount,
            state: 1, // Created
            createdAt: admin.firestore.Timestamp.fromMillis(time),
            reason: null,
          })

        res.json({ result: { create_time: time, transaction: id, state: 1 } })
        break

      case "perform_transaction":
        // Perform transaction
        const performId = params.id
        const performDoc = await admin.firestore().doc(`transactions/${performId}`).get()

        if (!performDoc.exists) {
          res.json({ error: -31003, error_note: "Transaction not found" })
          return
        }

        const performData = performDoc.data()
        if (performData?.state !== 1) {
          res.json({ error: -31008, error_note: "Transaction cannot be performed" })
          return
        }

        // Update transaction and user subscription
        const performTime = Date.now()
        await admin
          .firestore()
          .doc(`transactions/${performId}`)
          .update({
            state: 2, // Performed
            performedAt: admin.firestore.Timestamp.fromMillis(performTime),
          })

        if (performData?.userId) {
          await admin.firestore().doc(`users/${performData.userId}`).update({
            plan: "pro",
            subscriptionStatus: "active",
          })
        }

        res.json({
          result: {
            perform_time: performTime,
            transaction: performId,
            state: 2,
          },
        })
        break

      case "cancel_transaction":
        // Cancel transaction
        const cancelId = params.id
        const cancelDoc = await admin.firestore().doc(`transactions/${cancelId}`).get()

        if (!cancelDoc.exists) {
          res.json({ error: -31003, error_note: "Transaction not found" })
          return
        }

        const cancelData = cancelDoc.data()
        if (cancelData?.state === 2) {
          res.json({ error: -31007, error_note: "Transaction already performed" })
          return
        }

        const cancelTime = Date.now()
        await admin
          .firestore()
          .doc(`transactions/${cancelId}`)
          .update({
            state: -1, // Cancelled
            canceledAt: admin.firestore.Timestamp.fromMillis(cancelTime),
            reason: params.reason,
          })

        res.json({
          result: {
            cancel_time: cancelTime,
            transaction: cancelId,
            state: -1,
          },
        })
        break

      default:
        res.json({ error: -32601, error_note: "Method not found" })
    }
  } catch (error) {
    console.error("Click webhook error:", error)
    res.json({ error: -32400, error_note: "Invalid request" })
  }
})
