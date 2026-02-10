/**
 * FERRUM MMO - Game Balance Calculator
 * Centralizes calculations for building costs, times, production, and unit stats
 * based on defined balance data.
 */

const economicBalance = require("../data/economic_balance.json");
const militaryBalance = require("../data/military_balance.json");

class GameBalanceCalculator {

    /**
     * Calculates the cost for a given building type and level.
     * Cost = Base_Cost * (Cost_Multiplier ^ (Level - 1))
     * @param {string} buildingType
     * @param {number} level
     * @returns {Object} Resource costs
     */
    static getBuildingCost(buildingType, level) {
        const buildingData = economicBalance.buildings[buildingType];
        if (!buildingData) throw new Error(`Building type ${buildingType} not found.`);

        const cost = {};
        for (const res in buildingData.base_cost) {
            cost[res] = Math.floor(buildingData.base_cost[res] * Math.pow(buildingData.cost_multiplier, level - 1));
        }
        return cost;
    }

    /**
     * Calculates the build time for a given building type and level.
     * Time = Base_Time_Seconds * (Time_Multiplier ^ (Level - 1))
     * @param {string} buildingType
     * @param {number} level
     * @returns {number} Build time in milliseconds
     */
    static getBuildingTime(buildingType, level) {
        const buildingData = economicBalance.buildings[buildingType];
        if (!buildingData) throw new Error(`Building type ${buildingType} not found.`);

        const timeSeconds = buildingData.base_time_seconds * Math.pow(buildingData.time_multiplier, level - 1);
        return Math.floor(timeSeconds * 1000); // Convert to milliseconds
    }

    /**
     * Calculates the production per hour for a resource building at a given level.
     * @param {string} buildingType
     * @param {number} level
     * @returns {number} Production per hour
     */
    static getProductionPerHour(buildingType, level) {
        const buildingData = economicBalance.buildings[buildingType];
        if (!buildingData || !buildingData.production_per_hour) return 0;
        // Simple linear scaling for production for now, can be adjusted.
        return buildingData.production_per_hour * level;
    }

    /**
     * Calculates the population capacity provided by a Farm at a given level.
     * @param {number} level
     * @returns {number} Population capacity
     */
    static getFarmPopulationCapacity(level) {
        const farmData = economicBalance.buildings.farm;
        if (!farmData) return 0;
        return farmData.population_capacity_per_level * level;
    }

    /**
     * Calculates the storage capacity provided by a Warehouse at a given level.
     * @param {number} level
     * @returns {number} Storage capacity
     */
    static getWarehouseStorageCapacity(level) {
        const warehouseData = economicBalance.buildings.warehouse;
        if (!warehouseData) return 0;
        return warehouseData.storage_capacity_per_level * level;
    }

    /**
     * Retrieves unit stats for a given unit type.
     * @param {string} unitType
     * @returns {Object} Unit data
     */
    static getUnitStats(unitType) {
        const unit = militaryBalance.units.find(u => u.id === unitType);
        if (!unit) throw new Error(`Unit type ${unitType} not found.`);
        return unit;
    }

    /**
     * Calculates the recruitment cost for a given unit type and count.
     * @param {string} unitType
     * @param {number} count
     * @returns {Object} Resource costs
     */
    static getUnitRecruitmentCost(unitType, count) {
        const unit = this.getUnitStats(unitType);
        const cost = {};
        for (const res in unit.cost) {
            cost[res] = unit.cost[res] * count;
        }
        return cost;
    }

    /**
     * Calculates the recruitment time for a given unit type and count.
     * @param {string} unitType
     * @param {number} count
     * @returns {number} Recruitment time in milliseconds
     */
    static getUnitRecruitmentTime(unitType, count) {
        const unit = this.getUnitStats(unitType);
        // Recruitment time scales linearly with count, and can be modified by building bonuses
        return unit.recruitment_time_seconds * count * 1000; // Convert to milliseconds
    }

    /**
     * Get max level for a building
     * @param {string} buildingType
     * @returns {number}
     */
    static getBuildingMaxLevel(buildingType) {
        const buildingData = economicBalance.buildings[buildingType];
        if (!buildingData) throw new Error(`Building type ${buildingType} not found.`);
        return buildingData.max_level;
    }

    /**
     * Get starting resources
     * @returns {Object}
     */
    static getStartingResources() {
        return economicBalance.starting_resources;
    }
}

module.exports = GameBalanceCalculator;
