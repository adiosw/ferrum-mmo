import Stripe from "stripe";
import { ENV } from "./_core/env";

let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

export interface CreateCheckoutSessionParams {
  userId: number;
  type: "crowns" | "premium";
  packageId?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

/**
 * Create Stripe checkout session for payment
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSession> {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }
  const { userId, type, packageId, successUrl, cancelUrl } = params;

  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let metadata: Record<string, string> = {
    userId: userId.toString(),
    type,
  };

  if (type === "crowns") {
    // Crown packages
    const packages: Record<string, { crowns: number; price: number }> = {
      small: { crowns: 20, price: 900 }, // 9 PLN in cents
      medium: { crowns: 50, price: 1900 }, // 19 PLN
      large: { crowns: 120, price: 3900 }, // 39 PLN
      xlarge: { crowns: 300, price: 7900 }, // 79 PLN
    };

    const pkg = packages[packageId || "medium"];
    if (!pkg) throw new Error("Invalid package ID");

    metadata.crowns = pkg.crowns.toString();

    lineItems = [
      {
        price_data: {
          currency: "pln",
          product_data: {
            name: `FERRUM - ${pkg.crowns} Koron`,
            description: `Zakup ${pkg.crowns} koron do gry FERRUM MMO`,
          },
          unit_amount: pkg.price,
        },
        quantity: 1,
      },
    ];
  } else if (type === "premium") {
    // Premium subscription (30 days)
    lineItems = [
      {
        price_data: {
          currency: "pln",
          product_data: {
            name: "FERRUM - Premium (30 dni)",
            description:
              "Konto Premium z bonusami: +20% budowy, +20% rekrutacji, +1 slot kolejki",
          },
          unit_amount: 2500, // 25 PLN in cents
        },
        quantity: 1,
      },
    ];

    metadata.duration = "30";
  }

  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    locale: "pl",
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Retrieve checkout session details
 */
export async function getCheckoutSession(sessionId: string) {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }
  return await stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): Record<string, any> | null {
  try {
    if (!stripe) {
      throw new Error("Stripe not configured");
    }
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error("[Stripe] Webhook verification failed:", error);
    return null;
  }
}

/**
 * Handle successful payment
 */
export async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  const userId = parseInt(session.metadata?.userId || "0");
  const type = session.metadata?.type || "";

  if (!userId || !type) {
    throw new Error("Invalid session metadata");
  }

  return {
    userId,
    type,
    crowns: session.metadata?.crowns ? parseInt(session.metadata.crowns) : 0,
    duration: session.metadata?.duration ? parseInt(session.metadata.duration) : 0,
    amount: session.amount_total || 0,
    currency: session.currency || "pln",
  };
}

/**
 * Create refund
 */
export async function createRefund(
  chargeId: string,
  amount?: number
): Promise<Stripe.Refund> {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }
  return await stripe.refunds.create({
    charge: chargeId,
    amount,
  });
}

export default stripe || null;
