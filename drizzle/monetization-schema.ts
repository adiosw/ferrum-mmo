import { int, varchar, timestamp, decimal, boolean, mysqlTable, json } from "drizzle-orm/mysql-core";
import { users } from "./schema";
import { playerProfiles } from "./mmo-schema";
import { relations } from "drizzle-orm";

/**
 * Monetization & Protection Tables for FERRUM MMO
 */

// User currency and premium status
export const userCurrency = mysqlTable("user_currency", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  crowns: int("crowns").default(0).notNull(),
  totalSpent: decimal("totalSpent", { precision: 10, scale: 2 }).default("0").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserCurrency = typeof userCurrency.$inferSelect;
export type InsertUserCurrency = typeof userCurrency.$inferInsert;

// Premium account status
export const userPremium = mysqlTable("user_premium", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  isPremium: boolean("isPremium").default(false).notNull(),
  expiresAt: timestamp("expiresAt"),
  purchasedAt: timestamp("purchasedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPremium = typeof userPremium.$inferSelect;
export type InsertUserPremium = typeof userPremium.$inferInsert;

// Starter protection status
export const starterProtection = mysqlTable("starter_protection", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  playerId: int("playerId").notNull().references(() => playerProfiles.id),
  protectionUntil: timestamp("protectionUntil").notNull(),
  removedEarly: boolean("removedEarly").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StarterProtection = typeof starterProtection.$inferSelect;
export type InsertStarterProtection = typeof starterProtection.$inferInsert;

// Purchase history
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // 'crowns', 'premium', 'booster'
  amount: int("amount"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("PLN").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending', 'completed', 'failed'
  metadata: json("metadata"), // Additional data like booster type, package size
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

// Booster usage tracking
export const boosters = mysqlTable("boosters", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  playerId: int("playerId").notNull().references(() => playerProfiles.id),
  type: varchar("type", { length: 50 }).notNull(), // 'instant_build', 'instant_recruit', etc.
  expiresAt: timestamp("expiresAt"),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Booster = typeof boosters.$inferSelect;
export type InsertBooster = typeof boosters.$inferInsert;

// Relations
export const userCurrencyRelations = relations(userCurrency, ({ one }) => ({
  user: one(users, {
    fields: [userCurrency.userId],
    references: [users.id],
  }),
}));

export const userPremiumRelations = relations(userPremium, ({ one }) => ({
  user: one(users, {
    fields: [userPremium.userId],
    references: [users.id],
  }),
}));

export const starterProtectionRelations = relations(starterProtection, ({ one }) => ({
  user: one(users, {
    fields: [starterProtection.userId],
    references: [users.id],
  }),
  player: one(playerProfiles, {
    fields: [starterProtection.playerId],
    references: [playerProfiles.id],
  }),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
}));

export const boostersRelations = relations(boosters, ({ one }) => ({
  user: one(users, {
    fields: [boosters.userId],
    references: [users.id],
  }),
  player: one(playerProfiles, {
    fields: [boosters.playerId],
    references: [playerProfiles.id],
  }),
}));
