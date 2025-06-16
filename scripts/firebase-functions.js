// Firebase Cloud Functions for Salomat.health
// This script shows the structure of Cloud Functions that would be deployed

const functions = require("firebase-functions")
const admin = require("firebase-admin")
const cors = require("cors")({ origin: true })

admin.initializeApp()

// AI Chat Function
exports.callAIModel = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      // Verify Firebase token
      const token = req.headers.authorization?.split("Bearer ")[1]
      if (!token) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const decodedToken = await admin.auth().verifyIdToken(token)
      const uid = decodedToken.uid

      // Get user data
      const userDoc = await admin.firestore().collection("users").doc(uid).get()
      const userData = userDoc.data()

      if (!userData) {
        return res.status(404).json({ error: "User not found" })
      }

      // Check token limits
      const dailyLimit = userData.plan === "free" ? 10 : userData.plan === "pro" ? 1000 : 0
      if (userData.tokenUsedToday >= dailyLimit) {
        return res.status(429).json({ error: "Daily token limit exceeded" })
      }

      const { message, history } = req.body

      // Call OpenRouter API
      const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${functions.config().openrouter.api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful medical AI assistant. Provide general health information but always recommend consulting with healthcare professionals for specific medical advice.",
            },
            ...history,
            { role: "user", content: message },
          ],
          temperature: 0.7,
        }),
      })

      const aiResponse = await openRouterResponse.json()
      const responseText = aiResponse.choices[0].message.content
      const tokensUsed = aiResponse.usage.total_tokens

      // Update user token usage
      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .update({
          tokenUsedToday: admin.firestore.FieldValue.increment(tokensUsed),
        })

      // Log the interaction
      await admin
        .firestore()
        .collection("logs")
        .add({
          uid,
          model: "gpt-3.5-turbo",
          tokenCount: tokensUsed,
          promptExcerpt: message.substring(0, 100),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        })

      res.json({ response: responseText, tokensUsed })
    } catch (error) {
      console.error("Error in callAIModel:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  })
})

// Reset daily token usage (scheduled function)
exports.resetTokenUsage = functions.pubsub.schedule("0 0 * * *").onRun(async (context) => {
  const batch = admin.firestore().batch()
  const usersSnapshot = await admin.firestore().collection("users").get()

  usersSnapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { tokenUsedToday: 0 })
  })

  await batch.commit()
  console.log("Daily token usage reset completed")
})

// Create Stripe checkout session
exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const token = req.headers.authorization?.split("Bearer ")[1]
      const decodedToken = await admin.auth().verifyIdToken(token)
      const uid = decodedToken.uid

      const { planId, provider } = req.body

      if (provider === "stripe") {
        const stripe = require("stripe")(functions.config().stripe.secret_key)

        const session = await stripe.checkout.sessions.create({
          customer_email: decodedToken.email,
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: planId === "pro" ? "Pro Plan" : "Free Plan",
                },
                unit_amount: planId === "pro" ? 999 : 0, // $9.99 in cents
                recurring: {
                  interval: "month",
                },
              },
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${req.headers.origin}/billing?success=true`,
          cancel_url: `${req.headers.origin}/billing?canceled=true`,
          metadata: {
            uid,
            planId,
          },
        })

        res.json({ url: session.url })
      } else {
        // Click payment integration would go here
        res.status(400).json({ error: "Click payment not implemented yet" })
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  })
})

// Handle payment webhooks
exports.handlePaymentWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Stripe webhook handling
    const stripe = require("stripe")(functions.config().stripe.secret_key)
    const sig = req.headers["stripe-signature"]
    const endpointSecret = functions.config().stripe.webhook_secret

    let event
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const { uid, planId } = session.metadata

      // Update user subscription
      await admin.firestore().collection("users").doc(uid).update({
        plan: planId,
        subscriptionStatus: "active",
      })

      // Create subscription record
      await admin
        .firestore()
        .collection("subscriptions")
        .doc(uid)
        .set({
          uid,
          status: "active",
          plan: planId,
          startAt: admin.firestore.FieldValue.serverTimestamp(),
          endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          provider: "stripe",
          paymentHistory: [
            {
              paymentId: session.payment_intent,
              amount: session.amount_total / 100,
              date: admin.firestore.FieldValue.serverTimestamp(),
            },
          ],
        })
    }

    res.json({ received: true })
  } catch (error) {
    console.error("Error handling webhook:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

console.log("Firebase Cloud Functions structure defined")
console.log("Deploy these functions using: firebase deploy --only functions")
