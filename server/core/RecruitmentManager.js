/**
 * FERRUM MMO - Recruitment Manager
 * Handles unit recruitment, population checks, and costs.
 */

const ResourceManager = require('./ResourceManager');
const GameBalanceCalculator = require('./GameBalanceCalculator');

class RecruitmentManager {
    /**
     * Start unit recruitment.
     */
    static recruitUnits(village, unitType, count) {
        const unit = GameBalanceCalculator.getUnitStats(unitType);


        // 1. Calculate total cost
        const totalCost = {};
        Object.keys(unit.cost).forEach(res => {
            totalCost[res] = unit.cost[res] * count;
        });

        // 2. Check resources
        if (!ResourceManager.hasEnough(village.resources, totalCost)) {
            throw new Error("Insufficient resources for recruitment");
        }

        // 3. Check population (Farm capacity)
        const currentPop = village.population || 0;
        const maxPop = GameBalanceCalculator.getFarmPopulationCapacity(village.buildings.farm || 0);
        if (currentPop + count > maxPop) {
            throw new Error("Not enough population capacity in Farm");
        }

        // 4. Deduct resources and return updated village state
        const updatedResources = ResourceManager.deductResources(village.resources, totalCost);
        
        return {
            updatedResources,
            recruitmentTask: {
                unit_type: unitType,
                count: count,
                finish_time: Date.now() + GameBalanceCalculator.getUnitRecruitmentTime(unitType, count)
            }
        };
    }
}

module.exports = RecruitmentManager;
