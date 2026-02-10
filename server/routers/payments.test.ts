import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

// Mock database
vi.mock("../db", () => ({
  getDb: vi.fn(() => null),
}));

// Mock Stripe
vi.mock("../stripe-service", () => ({
  createCheckoutSession: vi.fn(() => ({
    sessionId: "test-session-123",
    url: "https://checkout.stripe.com/test",
  })),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("payments router", () => {
  it("should create checkout session for crowns", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.payments.createCheckoutSession({
      type: "crowns",
      packageId: "medium",
    });

    expect(result.success).toBe(true);
    expect(result.sessionId).toBe("test-session-123");
    expect(result.url).toBe("https://checkout.stripe.com/test");
  });

  it("should create checkout session for premium", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.payments.createCheckoutSession({
      type: "premium",
    });

    expect(result.success).toBe(true);
    expect(result.sessionId).toBe("test-session-123");
  });

  it("should get currency balance", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.payments.getCurrencyBalance();

    expect(result).toHaveProperty("crowns");
    expect(typeof result.crowns).toBe("number");
  });

  it("should get premium status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.payments.getPremiumStatus();

    expect(result).toHaveProperty("isPremium");
    expect(result).toHaveProperty("expiresAt");
    expect(typeof result.isPremium).toBe("boolean");
  });
});
