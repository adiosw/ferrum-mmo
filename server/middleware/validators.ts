import { getDb } from "../db";
import { userPremium, starterProtection } from "../../drizzle/monetization-schema";
import { eq } from "drizzle-orm";

/**
 * Check if user has active premium
 */
export async function validatePremium(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(userPremium)
    .where(eq(userPremium.userId, userId))
    .limit(1);

  if (!result.length) return false;

  const premium = result[0];
  if (!premium.isPremium || !premium.expiresAt) return false;

  return premium.expiresAt > new Date();
}

/**
 * Get premium bonuses for user
 */
export async function getPremiumBonuses(userId: number) {
  const hasPremium = await validatePremium(userId);

  return {
    buildingSpeedBonus: hasPremium ? 0.2 : 0, // +20%
    recruitmentSpeedBonus: hasPremium ? 0.2 : 0, // +20%
    extraBuildSlots: hasPremium ? 1 : 0, // +1 slot
  };
}

/**
 * Check if user is protected from attacks
 */
export async function validateProtection(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(starterProtection)
    .where(eq(starterProtection.userId, userId))
    .limit(1);

  if (!result.length) return false;

  const protection = result[0];
  return protection.protectionUntil > new Date();
}

/**
 * Get remaining protection time in milliseconds
 */
export async function getRemainingProtectionTime(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(starterProtection)
    .where(eq(starterProtection.userId, userId))
    .limit(1);

  if (!result.length) return 0;

  const protection = result[0];
  const now = new Date();
  const remaining = protection.protectionUntil.getTime() - now.getTime();

  return remaining > 0 ? remaining : 0;
}

/**
 * Remove starter protection early
 */
export async function removeProtectionEarly(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(starterProtection)
      .set({
        removedEarly: true,
        protectionUntil: new Date(),
      })
      .where(eq(starterProtection.userId, userId));

    return true;
  } catch (error) {
    console.error("[Protection] Failed to remove early:", error);
    return false;
  }
}

/**
 * Apply premium bonuses to build time
 */
export function applyBuildingBonus(baseTime: number, premiumBonus: number): number {
  return baseTime / (1 + premiumBonus);
}

/**
 * Apply premium bonuses to recruitment time
 */
export function applyRecruitmentBonus(baseTime: number, premiumBonus: number): number {
  return baseTime / (1 + premiumBonus);
}

/**
 * Calculate total build queue slots
 */
export function getTotalBuildSlots(hasPremium: boolean): number {
  const baseSlotsSlots = 3;
  const premiumSlots = hasPremium ? 1 : 0;
  return baseSlotsSlots + premiumSlots;
}

/**
 * Check if action is allowed (not protected)
 */
export async function canAttack(
  attackerId: number,
  defenderId: number
): Promise<{ allowed: boolean; reason?: string }> {
  // Check if defender is protected
  const isProtected = await validateProtection(defenderId);

  if (isProtected) {
    return {
      allowed: false,
      reason: "Target is protected by starter protection",
    };
  }

  return { allowed: true };
}
