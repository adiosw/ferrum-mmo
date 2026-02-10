/**
 * FERRUM MMO - Resource Manager
 * Handles offline progression and resource calculations based on timestamps.
 */

class ResourceManager {
    /**
     * Calculate current resources based on production and elapsed time.
     * Formula: State = (Now - Last_Update) * Production_per_Hour + Previous_State
     * 
     * @param {Object} village - The village object containing resources and production
     * @param {number} currentTime - Current timestamp (ms)
     * @returns {Object} Updated resources
     */
    static calculateResources(village, currentTime = Date.now()) {
        const lastUpdate = village.resources.last_update;
        const elapsedSeconds = (currentTime - lastUpdate) / 1000;
        const elapsedHours = elapsedSeconds / 3600;

        const updatedResources = { ...village.resources };
        
        // Update each resource type
        ['wood', 'stone', 'iron', 'grain'].forEach(res => {
            const production = village.production[res] || 0; // This will be calculated based on building levels and economic_balance.json
            // For now, assume village.production is pre-calculated based on building levels.
            // In a full implementation, this would involve looking up building data from economic_balance.json
            // and calculating total production based on building levels.
            const gained = elapsedHours * production;
            updatedResources[res] = Math.floor(village.resources[res] + gained);
        });

        updatedResources.last_update = currentTime;
        return updatedResources;
    }

    /**
     * Check if village has enough resources for a cost.
     */
    static hasEnough(currentRes, cost) {
        return Object.keys(cost).every(res => (currentRes[res] || 0) >= cost[res]);
    }

    /**
     * Deduct resources from village.
     */
    static deductResources(currentRes, cost) {
        const newRes = { ...currentRes };
        Object.keys(cost).forEach(res => {
            newRes[res] -= cost[res];
        });
        return newRes;
    }
}

module.exports = ResourceManager;
