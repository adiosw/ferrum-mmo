import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createCheckoutSession } from "../stripe-service";
import { getDb } from "../db";
import { purchases, userCurrency, userPremium } from "../../drizzle/monetization-schema";
import { eq } from "drizzle-orm";

export const paymentsRouter = router({
  /**
   * Create Stripe checkout session
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        type: z.enum(["crowns", "premium"]),
        packageId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      try {
        const session = await createCheckoutSession({
          userId,
          type: input.type,
          packageId: input.packageId,
          successUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/shop`,
        });

        // Store pending purchase
        const db = await getDb();
        if (db) {
          await db.insert(purchases).values({
            userId,
            type: input.type,
            price: "0", // Will be updated by webhook
            currency: "PLN",
            stripeSessionId: session.sessionId,
            status: "pending",
          });
        }

        return {
          success: true,
          sessionId: session.sessionId,
          url: session.url,
        };
      } catch (error) {
        console.error("[Payments] Checkout creation failed:", error);
        throw new Error("Failed to create checkout session");
      }
    }),

  /**
   * Get user currency balance
   */
  getCurrencyBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { crowns: 0 };

    const result = await db
      .select()
      .from(userCurrency)
      .where(eq(userCurrency.userId, ctx.user.id))
      .limit(1);

    return {
      crowns: result[0]?.crowns || 0,
    };
  }),

  /**
   * Get premium status
   */
  getPremiumStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { isPremium: false, expiresAt: null };

    const result = await db
      .select()
      .from(userPremium)
      .where(eq(userPremium.userId, ctx.user.id))
      .limit(1);

    const premium = result[0];
    if (!premium) return { isPremium: false, expiresAt: null };

    const now = new Date();
    const isPremium = premium.isPremium && premium.expiresAt && premium.expiresAt > now;

    return {
      isPremium,
      expiresAt: premium.expiresAt,
      purchasedAt: premium.purchasedAt,
    };
  }),

  /**
   * Get purchase history
   */
  getPurchaseHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const result = await db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, ctx.user.id))
      .orderBy((t) => t.createdAt);

    return result.map((p) => ({
      id: p.id,
      type: p.type,
      amount: p.amount,
      price: p.price,
      status: p.status,
      createdAt: p.createdAt,
      completedAt: p.completedAt,
    }));
  }),

  /**
   * Spend crowns (for boosters, etc.)
   */
  spendCrowns: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Get current balance
      const result = await db
        .select()
        .from(userCurrency)
        .where(eq(userCurrency.userId, userId))
        .limit(1);

      const current = result[0];
      if (!current || current.crowns < input.amount) {
        throw new Error("Insufficient crowns");
      }

      // Deduct crowns
      await db
        .update(userCurrency)
        .set({
          crowns: current.crowns - input.amount,
        })
        .where(eq(userCurrency.userId, userId));

      return {
        success: true,
        newBalance: current.crowns - input.amount,
      };
    }),
});
