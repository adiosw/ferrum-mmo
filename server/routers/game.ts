import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { playerProfiles, villages, armies, lords, battleReports } from "../../drizzle/mmo-schema";
import { eq, or, SQL } from "drizzle-orm";

export const gameRouter = router({
  // Initialize player profile
  initializePlayer: protectedProcedure
    .input(z.object({ playerName: z.string().min(3).max(64) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if player already exists
      const existing = await db
        .select()
        .from(playerProfiles)
        .where(eq(playerProfiles.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        return { success: false, error: "Player already initialized" };
      }

      // Create player profile
      const result = await db.insert(playerProfiles).values({
        userId: ctx.user.id,
        playerName: input.playerName,
        level: 1,
        experience: 0,
        gold: 0,
      });

      const playerId = result[0].insertId as number;

      // Create starting village
      const villageId = `village_${ctx.user.id}_1`;
      const randomX = Math.floor(Math.random() * 100);
      const randomY = Math.floor(Math.random() * 100);

      await db.insert(villages).values({
        id: villageId,
        playerId: playerId,
        name: "Główna Wioska",
        x: randomX,
        y: randomY,
        type: "player",
        owner: input.playerName,
        resources: JSON.stringify({ wood: 1000, stone: 500, iron: 200, grain: 1500 }),
        production: JSON.stringify({ wood: 50, stone: 40, iron: 20, grain: 100 }),
        buildings: JSON.stringify({
          town_hall: 1,
          woodcutter: 1,
          quarry: 1,
          iron_mine: 1,
          farm: 1,
          warehouse: 1,
        }),
        population: 50,
        loyalty: 100,
      });

      // Create lord
      const lordId = `lord_${ctx.user.id}_1`;
      const birthDate = new Date();
      const deathDate = new Date(birthDate.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days

      await db.insert(lords).values({
        id: lordId,
        playerId: playerId,
        name: input.playerName,
        dnaId: `DNA_${Math.random().toString(36).substr(2, 9)}`,
        traits: JSON.stringify(["commander"]),
        flaws: JSON.stringify([]),
        birthDate,
        deathDate,
        experience: 0,
      });

      return { success: true, villageId, lordId };
    }),

  // Get player game state
  getGameState: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const profile = await db
      .select()
      .from(playerProfiles)
      .where(eq(playerProfiles.userId, ctx.user.id))
      .limit(1);

    if (profile.length === 0) {
      return null;
    }

    const playerVillages = await db
      .select()
      .from(villages)
      .where(eq(villages.playerId, profile[0].id));

    const playerArmies = await db
      .select()
      .from(armies)
      .where(eq(armies.playerId, profile[0].id));

    const playerLords = await db
      .select()
      .from(lords)
      .where(eq(lords.playerId, profile[0].id));

    return {
      profile: profile[0],
      villages: playerVillages,
      armies: playerArmies,
      lords: playerLords,
    };
  }),

  // Get world map state
  getWorldMap: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const allVillages = await db.select().from(villages);
    return { villages: allVillages };
  }),

  // Send army to attack
  sendArmy: protectedProcedure
    .input(
      z.object({
        villageId: z.string(),
        targetX: z.number(),
        targetY: z.number(),
        units: z.record(z.string(), z.number()),
        tactics: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const profile = await db
        .select()
        .from(playerProfiles)
        .where(eq(playerProfiles.userId, ctx.user.id))
        .limit(1);

      if (profile.length === 0) throw new Error("Player not found");

      const village = await db
        .select()
        .from(villages)
        .where(eq(villages.id, input.villageId))
        .limit(1);

      if (village.length === 0) throw new Error("Village not found");

      // Calculate march time (simplified: 1 minute per tile distance)
      const dx = input.targetX - village[0].x;
      const dy = input.targetY - village[0].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const marchTimeMs = Math.ceil(distance * 60 * 1000);

      const armyId = `army_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const arrivalTime = new Date(Date.now() + marchTimeMs);

      await db.insert(armies).values({
        id: armyId,
        playerId: profile[0].id,
        villageId: input.villageId,
        units: JSON.stringify(input.units),
        fromX: village[0].x,
        fromY: village[0].y,
        toX: input.targetX,
        toY: input.targetY,
        status: "marching",
        arrivalTime,
        tactics: input.tactics || "balanced",
      });

      return { success: true, armyId, arrivalTime };
    }),

  // Start building
  startBuild: protectedProcedure
    .input(
      z.object({
        villageId: z.string(),
        buildingType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const village = await db
        .select()
        .from(villages)
        .where(eq(villages.id, input.villageId))
        .limit(1);

      if (village.length === 0) throw new Error("Village not found");

      // Simple cost calculation
      const buildings = JSON.parse(village[0].buildings as string);
      const currentLevel = buildings[input.buildingType] || 0;
      const baseCost = 100;
      const costMultiplier = 1.2;
      const cost = Math.floor(baseCost * Math.pow(costMultiplier, currentLevel));

      const resources = JSON.parse(village[0].resources as string);
      if (resources.wood < cost) {
        throw new Error("Insufficient resources");
      }

      // Deduct resources
      resources.wood -= cost;
      await db
        .update(villages)
        .set({ resources: JSON.stringify(resources) })
        .where(eq(villages.id, input.villageId));

      // Calculate build time (simplified: 5 minutes + 1 minute per level)
      const buildTimeMs = (5 + currentLevel) * 60 * 1000;
      const endTime = new Date(Date.now() + buildTimeMs);

      return { success: true, endTime };
    }),

  // Recruit units
  recruitUnits: protectedProcedure
    .input(
      z.object({
        villageId: z.string(),
        unitType: z.string(),
        count: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const village = await db
        .select()
        .from(villages)
        .where(eq(villages.id, input.villageId))
        .limit(1);

      if (village.length === 0) throw new Error("Village not found");

      // Unit costs
      const unitCosts: Record<string, Record<string, number>> = {
        spearman: { wood: 50, grain: 30 },
        swordsman: { wood: 80, iron: 20, grain: 40 },
        archer: { wood: 60, iron: 10, grain: 30 },
        cavalry: { wood: 100, iron: 40, grain: 60 },
      };

      const cost = unitCosts[input.unitType];
      if (!cost) throw new Error("Unknown unit type");

      const resources = JSON.parse(village[0].resources as string);
      for (const [resource, amount] of Object.entries(cost)) {
        if ((resources as any)[resource] < (amount as number) * input.count) {
          throw new Error(`Insufficient ${resource}`);
        }
      }

      // Deduct resources
      for (const [resource, amount] of Object.entries(cost)) {
        (resources as any)[resource] -= (amount as number) * input.count;
      }

      await db
        .update(villages)
        .set({ resources: JSON.stringify(resources) })
        .where(eq(villages.id, input.villageId));

      // Calculate recruitment time
      const recruitTimeMs = (60 + input.count * 10) * 1000;
      const endTime = new Date(Date.now() + recruitTimeMs);

      return { success: true, endTime };
    }),

  // Get battle reports
  getBattleReports: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const profile = await db
      .select()
      .from(playerProfiles)
      .where(eq(playerProfiles.userId, ctx.user.id))
      .limit(1);

    if (profile.length === 0) return [];

    const playerId = profile[0].id;
    const reports = await db
      .select()
      .from(battleReports)
      .where(
        or(
          eq(battleReports.attackerId, playerId),
          eq(battleReports.defenderId, playerId)
        )
      );

    return reports;
  }),
});
