import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal, boolean, bigint } from "drizzle-orm/mysql-core";
import { users } from "./schema";
import { relations } from "drizzle-orm";

/**
 * MMO Game Tables for FERRUM
 * Extends the base user table with game-specific data
 */

// Player profiles with game data
export const playerProfiles = mysqlTable("player_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  playerName: varchar("playerName", { length: 64 }).notNull().unique(),
  level: int("level").default(1).notNull(),
  experience: bigint("experience", { mode: 'number' }).default(0).notNull(),
  gold: int("gold").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Villages on the world map
export const villages = mysqlTable("villages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  playerId: int("playerId").references(() => playerProfiles.id),
  name: varchar("name", { length: 128 }).notNull(),
  x: int("x").notNull(),
  y: int("y").notNull(),
  type: mysqlEnum("type", ["player", "barbarian", "treasure", "ruins"]).default("player").notNull(),
  owner: varchar("owner", { length: 64 }),
  resources: json("resources").default(JSON.stringify({ wood: 1000, stone: 500, iron: 200, grain: 1500 })).notNull(),
  production: json("production").default(JSON.stringify({ wood: 50, stone: 40, iron: 20, grain: 100 })).notNull(),
  buildings: json("buildings").default(JSON.stringify({})).notNull(),
  population: int("population").default(50).notNull(),
  loyalty: int("loyalty").default(100).notNull(),
  wallLevel: int("wallLevel").default(0).notNull(),
  lastUpdate: timestamp("lastUpdate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Armies marching on the map
export const armies = mysqlTable("armies", {
  id: varchar("id", { length: 64 }).primaryKey(),
  playerId: int("playerId").notNull().references(() => playerProfiles.id),
  villageId: varchar("villageId", { length: 64 }).notNull().references(() => villages.id),
  units: json("units").notNull(), // { spearman: 10, archer: 5, ... }
  fromX: int("fromX").notNull(),
  fromY: int("fromY").notNull(),
  toX: int("toX").notNull(),
  toY: int("toY").notNull(),
  status: mysqlEnum("status", ["marching", "attacking", "returning", "arrived"]).default("marching").notNull(),
  arrivalTime: timestamp("arrivalTime").notNull(),
  tactics: varchar("tactics", { length: 64 }).default("balanced"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Build queue for each village
export const buildQueue = mysqlTable("build_queue", {
  id: varchar("id", { length: 64 }).primaryKey(),
  villageId: varchar("villageId", { length: 64 }).notNull().references(() => villages.id),
  buildingType: varchar("buildingType", { length: 64 }).notNull(),
  level: int("level").notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Recruitment queue
export const recruitmentQueue = mysqlTable("recruitment_queue", {
  id: varchar("id", { length: 64 }).primaryKey(),
  villageId: varchar("villageId", { length: 64 }).notNull().references(() => villages.id),
  unitType: varchar("unitType", { length: 64 }).notNull(),
  count: int("count").notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Lords with dynasty system
export const lords = mysqlTable("lords", {
  id: varchar("id", { length: 64 }).primaryKey(),
  playerId: int("playerId").notNull().references(() => playerProfiles.id),
  name: varchar("name", { length: 128 }).notNull(),
  dnaId: varchar("dnaId", { length: 128 }).notNull(),
  traits: json("traits").default(JSON.stringify([])).notNull(), // Array of trait IDs
  flaws: json("flaws").default(JSON.stringify([])).notNull(), // Array of flaw IDs
  birthDate: timestamp("birthDate").notNull(),
  deathDate: timestamp("deathDate").notNull(),
  experience: int("experience").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Battle reports
export const battleReports = mysqlTable("battle_reports", {
  id: varchar("id", { length: 64 }).primaryKey(),
  attackerId: int("attackerId").notNull().references(() => playerProfiles.id),
  defenderId: int("defenderId").notNull().references(() => playerProfiles.id),
  villageId: varchar("villageId", { length: 64 }).notNull().references(() => villages.id),
  result: mysqlEnum("result", ["victory", "defeat", "draw"]).notNull(),
  attackerLosses: json("attackerLosses").notNull(),
  defenderLosses: json("defenderLosses").notNull(),
  resourcesGained: json("resourcesGained").notNull(),
  moraleChange: int("moraleChange").notNull(),
  tacticsUsed: varchar("tacticsUsed", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Vassalization relationships
export const vassals = mysqlTable("vassals", {
  id: varchar("id", { length: 64 }).primaryKey(),
  lordId: int("lordId").notNull().references(() => playerProfiles.id),
  vasalId: int("vasalId").notNull().references(() => playerProfiles.id),
  tributePercentage: int("tributePercentage").default(10).notNull(),
  ransomAmount: int("ransomAmount").default(0).notNull(),
  ransomPaid: int("ransomPaid").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Alliances
export const alliances = mysqlTable("alliances", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  tag: varchar("tag", { length: 8 }).notNull().unique(),
  leaderId: int("leaderId").notNull().references(() => playerProfiles.id),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Alliance members
export const allianceMembers = mysqlTable("alliance_members", {
  id: varchar("id", { length: 64 }).primaryKey(),
  allianceId: varchar("allianceId", { length: 64 }).notNull().references(() => alliances.id),
  playerId: int("playerId").notNull().references(() => playerProfiles.id),
  role: mysqlEnum("role", ["leader", "officer", "member"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

// Game events (raids, plagues, etc.)
export const gameEvents = mysqlTable("game_events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  type: mysqlEnum("type", ["raid", "plague", "treasure", "revolt", "meteor"]).notNull(),
  villageId: varchar("villageId", { length: 64 }).notNull().references(() => villages.id),
  description: text("description"),
  impact: json("impact").notNull(), // { resourceLoss: 100, populationLoss: 10, ... }
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Relations
export const playerProfilesRelations = relations(playerProfiles, ({ one, many }) => ({
  user: one(users, { fields: [playerProfiles.userId], references: [users.id] }),
  villages: many(villages),
  lords: many(lords),
  armies: many(armies),
}));

export const villagesRelations = relations(villages, ({ one, many }) => ({
  player: one(playerProfiles, { fields: [villages.playerId], references: [playerProfiles.id] }),
  armies: many(armies),
  buildQueue: many(buildQueue),
  recruitmentQueue: many(recruitmentQueue),
}));

export const armiesRelations = relations(armies, ({ one }) => ({
  player: one(playerProfiles, { fields: [armies.playerId], references: [playerProfiles.id] }),
  village: one(villages, { fields: [armies.villageId], references: [villages.id] }),
}));

export const lordsRelations = relations(lords, ({ one }) => ({
  player: one(playerProfiles, { fields: [lords.playerId], references: [playerProfiles.id] }),
}));

// Types
export type PlayerProfile = typeof playerProfiles.$inferSelect;
export type InsertPlayerProfile = typeof playerProfiles.$inferInsert;

// Fix for BigInt
declare global {
  interface BigInt {
    toJSON(): number;
  }
}

BigInt.prototype.toJSON = function () {
  return Number(this);
};
export type Village = typeof villages.$inferSelect;
export type InsertVillage = typeof villages.$inferInsert;
export type Army = typeof armies.$inferSelect;
export type InsertArmy = typeof armies.$inferInsert;
export type Lord = typeof lords.$inferSelect;
export type InsertLord = typeof lords.$inferInsert;
export type BattleReport = typeof battleReports.$inferSelect;
export type InsertBattleReport = typeof battleReports.$inferInsert;
