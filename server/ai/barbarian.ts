import { nanoid } from "nanoid";

interface BarbVillage {
  id: string;
  x: number;
  y: number;
  level: number;
  resources: Record<string, number>;
  units: Record<string, number>;
  lastAction: number;
}

interface AIAction {
  type: "gather" | "recruit" | "attack" | "defend";
  timestamp: number;
  data: any;
}

export class BarbariansAI {
  private villages: Map<string, BarbVillage> = new Map();
  private actions: AIAction[] = [];

  constructor() {
    // Initialize barbarian villages
    this.initializeVillages();
  }

  private initializeVillages() {
    const barbarPositions = [
      { x: 10, y: 10 },
      { x: 90, y: 10 },
      { x: 10, y: 90 },
      { x: 90, y: 90 },
      { x: 50, y: 50 },
      { x: 30, y: 70 },
      { x: 70, y: 30 },
      { x: 25, y: 25 },
      { x: 75, y: 75 },
      { x: 50, y: 20 },
    ];

    barbarPositions.forEach((pos) => {
      const village: BarbVillage = {
        id: `barb_${nanoid()}`,
        x: pos.x,
        y: pos.y,
        level: Math.floor(Math.random() * 5) + 1,
        resources: {
          wood: Math.random() * 1000,
          stone: Math.random() * 800,
          iron: Math.random() * 600,
          grain: Math.random() * 1200,
        },
        units: {
          spearman: Math.floor(Math.random() * 50) + 20,
          archer: Math.floor(Math.random() * 30) + 10,
          cavalry: Math.floor(Math.random() * 10) + 5,
        },
        lastAction: Date.now(),
      };
      this.villages.set(village.id, village);
    });
  }

  /**
   * Gather resources - barbarians collect resources slowly
   */
  gatherResources(villageId: string) {
    const village = this.villages.get(villageId);
    if (!village) return;

    const productionRate = village.level * 10;
    village.resources.wood += productionRate * 0.3;
    village.resources.stone += productionRate * 0.25;
    village.resources.iron += productionRate * 0.2;
    village.resources.grain += productionRate * 0.25;

    // Cap resources
    Object.keys(village.resources).forEach((key) => {
      village.resources[key] = Math.min(village.resources[key], 5000);
    });

    this.logAction({
      type: "gather",
      timestamp: Date.now(),
      data: { villageId, production: productionRate },
    });
  }

  /**
   * Recruit units - barbarians recruit slowly based on resources
   */
  recruitUnits(villageId: string) {
    const village = this.villages.get(villageId);
    if (!village) return;

    const hasResources =
      village.resources.wood > 100 &&
      village.resources.grain > 100;

    if (!hasResources) return;

    const unitType = this.selectRandomUnit();
    const unitCost = this.getUnitCost(unitType);

    if (
      village.resources.wood >= unitCost.wood &&
      village.resources.grain >= unitCost.grain
    ) {
      village.resources.wood -= unitCost.wood;
      village.resources.grain -= unitCost.grain;
      village.units[unitType] = (village.units[unitType] || 0) + 1;

      this.logAction({
        type: "recruit",
        timestamp: Date.now(),
        data: { villageId, unitType, count: 1 },
      });
    }
  }

  /**
   * Attack nearby player villages - barbarians randomly attack
   */
  selectAttackTarget(playerVillages: any[]): any | null {
    if (playerVillages.length === 0) return null;

    // 30% chance to attack
    if (Math.random() > 0.3) return null;

    // Select random player village
    return playerVillages[Math.floor(Math.random() * playerVillages.length)];
  }

  /**
   * Get barbarian village
   */
  getVillage(villageId: string): BarbVillage | undefined {
    return this.villages.get(villageId);
  }

  /**
   * Get all barbarian villages
   */
  getAllVillages(): BarbVillage[] {
    return Array.from(this.villages.values());
  }

  /**
   * Update barbarian village after battle
   */
  updateAfterBattle(villageId: string, losses: Record<string, number>) {
    const village = this.villages.get(villageId);
    if (!village) return;

    Object.keys(losses).forEach((unitType) => {
      village.units[unitType] = Math.max(
        0,
        (village.units[unitType] || 0) - losses[unitType]
      );
    });
  }

  /**
   * Process AI tick - called periodically
   */
  processTick() {
    this.villages.forEach((village) => {
      const timeSinceLastAction = Date.now() - village.lastAction;

      // Every 30 seconds, perform an action
      if (timeSinceLastAction > 30000) {
        const action = Math.random();

        if (action < 0.5) {
          this.gatherResources(village.id);
        } else if (action < 0.8) {
          this.recruitUnits(village.id);
        }

        village.lastAction = Date.now();
      }
    });
  }

  // Helper methods
  private selectRandomUnit(): string {
    const units = ["spearman", "archer", "cavalry"];
    return units[Math.floor(Math.random() * units.length)];
  }

  private getUnitCost(unitType: string): Record<string, number> {
    const costs: Record<string, Record<string, number>> = {
      spearman: { wood: 50, stone: 0, iron: 0, grain: 30 },
      archer: { wood: 60, stone: 10, iron: 0, grain: 30 },
      cavalry: { wood: 100, stone: 40, iron: 0, grain: 60 },
    };
    return costs[unitType] || { wood: 50, stone: 0, iron: 0, grain: 30 };
  }

  private logAction(action: AIAction) {
    this.actions.push(action);
    // Keep only last 1000 actions
    if (this.actions.length > 1000) {
      this.actions = this.actions.slice(-1000);
    }
  }
}

// Singleton instance
export const barbarianAI = new BarbariansAI();

// Start periodic AI processing
setInterval(() => {
  barbarianAI.processTick();
}, 5000); // Process every 5 seconds
