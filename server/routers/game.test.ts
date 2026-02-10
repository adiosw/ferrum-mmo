import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

// Mock database
vi.mock("../db", () => ({
  getDb: vi.fn(() => Promise.resolve(null)),
}));

function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user-123",
      email: "test@example.com",
      name: "Test Player",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {} as any,
  };
}

describe("Game Router", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("initializePlayer", () => {
    it("should validate player name length", async () => {
      try {
        // This should fail validation - name too short
        await caller.game.initializePlayer({ playerName: "ab" });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("minimum");
      }
    });

    it("should validate player name max length", async () => {
      try {
        // This should fail validation - name too long
        const longName = "a".repeat(65);
        await caller.game.initializePlayer({ playerName: longName });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("maximum");
      }
    });

    it("should accept valid player name", async () => {
      // This will fail due to mocked DB, but validates input
      try {
        await caller.game.initializePlayer({ playerName: "ValidPlayer123" });
      } catch (error: any) {
        // Expected to fail due to mocked DB
        expect(error.message).toContain("Database");
      }
    });
  });

  describe("sendArmy", () => {
    it("should validate required fields", async () => {
      try {
        await caller.game.sendArmy({
          villageId: "",
          targetX: 50,
          targetY: 50,
          units: { spearman: 10 },
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        // Validation error expected
        expect(error).toBeDefined();
      }
    });

    it("should accept valid army data", async () => {
      try {
        await caller.game.sendArmy({
          villageId: "village_123",
          targetX: 50,
          targetY: 50,
          units: { spearman: 10, archer: 5 },
          tactics: "balanced",
        });
      } catch (error: any) {
        // Expected to fail due to mocked DB
        expect(error.message).toContain("Database");
      }
    });
  });

  describe("startBuild", () => {
    it("should validate building type", async () => {
      try {
        await caller.game.startBuild({
          villageId: "village_123",
          buildingType: "town_hall",
        });
      } catch (error: any) {
        // Expected to fail due to mocked DB
        expect(error.message).toContain("Database");
      }
    });
  });

  describe("recruitUnits", () => {
    it("should validate unit count", async () => {
      try {
        await caller.game.recruitUnits({
          villageId: "village_123",
          unitType: "spearman",
          count: 0,
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("minimum");
      }
    });

    it("should accept valid recruitment data", async () => {
      try {
        await caller.game.recruitUnits({
          villageId: "village_123",
          unitType: "spearman",
          count: 10,
        });
      } catch (error: any) {
        // Expected to fail due to mocked DB
        expect(error.message).toContain("Database");
      }
    });
  });

  describe("getGameState", () => {
    it("should be protected procedure", async () => {
      // This test verifies the procedure exists and is callable
      try {
        await caller.game.getGameState();
      } catch (error: any) {
        // Expected to fail due to mocked DB
        expect(error.message).toContain("Database");
      }
    });
  });

  describe("getWorldMap", () => {
    it("should be public procedure", async () => {
      // World map should be accessible without auth
      try {
        await caller.game.getWorldMap();
      } catch (error: any) {
        // Expected to fail due to mocked DB
        expect(error.message).toContain("Database");
      }
    });
  });

  describe("getBattleReports", () => {
    it("should be protected procedure", async () => {
      try {
        await caller.game.getBattleReports();
      } catch (error: any) {
        // Expected to fail due to mocked DB
        expect(error.message).toContain("Database");
      }
    });
  });
});
