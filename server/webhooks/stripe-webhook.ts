import { Request, Response } from "express";
import { verifyWebhookSignature, handlePaymentSuccess } from "../stripe-service";
import { getDb } from "../db";
import { purchases, userCurrency, userPremium } from "../../drizzle/monetization-schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"] as string;
  const body = (req as any).rawBody || JSON.stringify(req.body) || "";

  if (!signature) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  // Verify webhook signature
  let event;
  try {
    event = verifyWebhookSignature(body, signature);
  } catch (error) {
    console.error("[Stripe Webhook] Signature verification failed:", error);
    return res.status(400).json({ error: "Invalid signature" });
  }

  if (!event) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(db, session);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(db, charge);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(db, subscription);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutCompleted(
  db: any,
  session: Stripe.Checkout.Session
) {
  const paymentData = await handlePaymentSuccess(session);

  // Update purchase status
  await db
    .update(purchases)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(purchases.stripeSessionId, session.id));

  if (paymentData.type === "crowns") {
    // Add crowns to user
    const existing = await db
      .select()
      .from(userCurrency)
      .where(eq(userCurrency.userId, paymentData.userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(userCurrency)
        .set({
          crowns: existing[0].crowns + paymentData.crowns,
        })
        .where(eq(userCurrency.userId, paymentData.userId));
    } else {
      await db.insert(userCurrency).values({
        userId: paymentData.userId,
        crowns: paymentData.crowns,
      });
    }

    console.log(
      `[Stripe] Added ${paymentData.crowns} crowns to user ${paymentData.userId}`
    );
  } else if (paymentData.type === "premium") {
    // Activate premium
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + paymentData.duration);

    const existing = await db
      .select()
      .from(userPremium)
      .where(eq(userPremium.userId, paymentData.userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(userPremium)
        .set({
          isPremium: true,
          expiresAt,
          purchasedAt: new Date(),
        })
        .where(eq(userPremium.userId, paymentData.userId));
    } else {
      await db.insert(userPremium).values({
        userId: paymentData.userId,
        isPremium: true,
        expiresAt,
        purchasedAt: new Date(),
      });
    }

    console.log(
      `[Stripe] Activated premium for user ${paymentData.userId} until ${expiresAt}`
    );
  }
}

/**
 * Handle refunded charge
 */
async function handleChargeRefunded(db: any, charge: Stripe.Charge) {
  // Find the purchase by charge ID
  const purchase = await db
    .select()
    .from(purchases)
    .where(eq(purchases.stripeSessionId, charge.payment_intent as string))
    .limit(1);

  if (purchase.length > 0) {
    // Update purchase status
    await db
      .update(purchases)
      .set({
        status: "failed",
      })
      .where(eq(purchases.id, purchase[0].id));

    console.log(`[Stripe] Refunded purchase ${purchase[0].id}`);
  }
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(
  db: any,
  subscription: Stripe.Subscription
) {
  // Find user by subscription metadata
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  // Deactivate premium
  await db
    .update(userPremium)
    .set({
      isPremium: false,
    })
    .where(eq(userPremium.userId, parseInt(userId)));

  console.log(`[Stripe] Deactivated premium for user ${userId}`);
}
