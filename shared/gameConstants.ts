/**
 * FERRUM MMO - Game Constants
 * All timing values are in MILLISECONDS
 * Game speed multiplier: 1.5x (like Tribal Wars)
 */

export const GAME_SPEED = 1.5;

// ===== TIME CONSTANTS (in seconds, will be converted to ms) =====
export const BASE_TIMES = {
  // Building times (base in seconds)
  building: {
    woodcutter: 300, // 5 min
    stone_mine: 400,
    iron_mine: 500,
    farm: 350,
    barracks: 600,
    stables: 700,
    workshop: 800,
    wall: 900,
    storage: 450,
    market: 550,
    academy: 1000,
    temple: 1100,
  },
  
  // Unit recruitment times (base in seconds)
  recruitment: {
    spearman: 60,
    swordsman: 90,
    archer: 75,
    cavalry: 150,
    ram: 200,
    catapult: 250,
    herald: 30,
  },

  // Army march time (base seconds per distance unit)
  marchPerDistance: 60, // 1 minute per tile

  // Starter protection (72 hours)
  starterProtection: 72 * 60 * 60, // 72 hours in seconds

  // Premium duration
  premiumDuration: 30 * 24 * 60 * 60, // 30 days in seconds
};

// ===== CALCULATED TIMES (with game speed applied) =====
export const GAME_TIMES = {
  building: Object.fromEntries(
    Object.entries(BASE_TIMES.building).map(([key, value]) => [
      key,
      (value * 1000) / GAME_SPEED, // Convert to ms and apply speed
    ])
  ),
  
  recruitment: Object.fromEntries(
    Object.entries(BASE_TIMES.recruitment).map(([key, value]) => [
      key,
      (value * 1000) / GAME_SPEED,
    ])
  ),

  marchPerDistance: (BASE_TIMES.marchPerDistance * 1000) / GAME_SPEED,
  starterProtection: BASE_TIMES.starterProtection * 1000,
  premiumDuration: BASE_TIMES.premiumDuration * 1000,
};

// ===== RESOURCE PRODUCTION =====
export const BASE_PRODUCTION = {
  // Resources per hour per building level
  woodcutter: 30,
  stone_mine: 25,
  iron_mine: 20,
  farm: 40,
};

export const PRODUCTION = Object.fromEntries(
  Object.entries(BASE_PRODUCTION).map(([key, value]) => [
    key,
    value * GAME_SPEED, // Multiply by game speed
  ])
);

// ===== COSTS =====
export const BUILDING_COSTS = {
  woodcutter: { wood: 0, stone: 0, iron: 0, grain: 0 },
  stone_mine: { wood: 100, stone: 0, iron: 0, grain: 50 },
  iron_mine: { wood: 150, stone: 100, iron: 0, grain: 75 },
  farm: { wood: 50, stone: 0, iron: 0, grain: 0 },
  barracks: { wood: 200, stone: 100, iron: 50, grain: 100 },
  stables: { wood: 250, stone: 150, iron: 100, grain: 150 },
  workshop: { wood: 300, stone: 200, iron: 150, grain: 200 },
  wall: { wood: 100, stone: 200, iron: 50, grain: 75 },
  storage: { wood: 75, stone: 75, iron: 0, grain: 50 },
  market: { wood: 150, stone: 100, iron: 50, grain: 100 },
  academy: { wood: 400, stone: 300, iron: 200, grain: 300 },
  temple: { wood: 350, stone: 350, iron: 100, grain: 250 },
};

export const UNIT_COSTS = {
  spearman: { wood: 50, stone: 0, iron: 0, grain: 30 },
  swordsman: { wood: 60, stone: 10, iron: 0, grain: 30 },
  archer: { wood: 60, stone: 10, iron: 0, grain: 30 },
  cavalry: { wood: 100, stone: 40, iron: 0, grain: 60 },
  ram: { wood: 150, stone: 100, iron: 50, grain: 75 },
  catapult: { wood: 200, stone: 150, iron: 100, grain: 100 },
  herald: { wood: 0, stone: 0, iron: 0, grain: 0 },
};

// ===== PREMIUM BONUSES =====
export const PREMIUM_BONUSES = {
  buildingSpeedBonus: 0.2, // +20%
  recruitmentSpeedBonus: 0.2, // +20%
  extraBuildSlots: 1, // +1 slot
};

// ===== STARTER PROTECTION =====
export const STARTER_PROTECTION = {
  duration: BASE_TIMES.starterProtection, // 72 hours
  canRemoveEarly: true,
};

// ===== MONETIZATION =====
export const PREMIUM_PACKAGES = {
  SMALL: { crowns: 20, price: 9 },
  MEDIUM: { crowns: 50, price: 19 },
  LARGE: { crowns: 120, price: 39 },
  XLARGE: { crowns: 300, price: 79 },
};

export const PREMIUM_SUBSCRIPTION = {
  price: 25,
  durationDays: 30,
};

export const BOOSTERS = {
  instantBuild: { cost: 50, effect: "instant_build" },
  instantRecruit: { cost: 40, effect: "instant_recruit" },
  armyReturn: { cost: 30, effect: "instant_return" },
  extraProtection: { cost: 25, crowns: 12, hours: 12 }, // +12h protection
};

// ===== COMBAT =====
export const COMBAT = {
  moraleLossPerDefeat: 0.1, // 10% morale loss
  moraleGainPerVictory: 0.05, // 5% morale gain
  desertionChance: 0.1, // 10% chance to desert at low morale
  tacticsBonus: 0.2, // +20% damage with correct tactic
};

// ===== VASSAL SYSTEM =====
export const VASSAL = {
  tributePercentage: 0.1, // 10% tribute
  ransomDuration: 30 * 24 * 60 * 60, // 30 days to pay ransom
};
