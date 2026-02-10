/**
 * FERRUM MMO - Build Queue Manager
 * Handles 3 free build slots with automatic task starting.
 */

const GameBalanceCalculator = require('./GameBalanceCalculator');

class BuildQueueManager {
    static MAX_SLOTS = 3; // Defined in requirements

    /**
     * Process the queue to finish completed buildings and start next ones.
     * @param {Object} village - Village object
     * @param {number} currentTime - Current timestamp
     */
    static processQueue(village, currentTime = Date.now()) {
        let queue = [...(village.build_queue || [])];
        let buildings = { ...village.buildings };
        let changed = false;

        // 1. Check for completed tasks
        const completedTasks = queue.filter(task => task.end_time <= currentTime);
        const remainingTasks = queue.filter(task => task.end_time > currentTime);

        if (completedTasks.length > 0) {
            completedTasks.forEach(task => {
                buildings[task.building_type] = task.level;
            });
            queue = remainingTasks;
            changed = true;
        }

        // 2. Auto-start logic: If the first remaining task hasn't started yet, 
        // but slots are available or it's next in line, we ensure its timing is correct.
        // In a real system, the 'end_time' of the next task is often calculated 
        // relative to the 'end_time' of the previous task in the queue.
        
        // Recalculate queue timings if something finished
        if (changed && queue.length > 0) {
            let lastEndTime = currentTime;
            queue = queue.map((task, index) => {
                const duration = task.end_time - task.start_time;
                const newStart = index === 0 ? currentTime : lastEndTime;
                const newEnd = newStart + duration;
                lastEndTime = newEnd;
                return { ...task, start_time: newStart, end_time: newEnd };
            });
        }

        return {
            updatedQueue: queue,
            updatedBuildings: buildings,
            changed
        };
    }

    /**
     * Add a building task to the queue.
     */
    static addToQueue(village, buildingType, level, currentTime = Date.now()) {
        const durationMs = GameBalanceCalculator.getBuildingTime(buildingType, level);
        const cost = GameBalanceCalculator.getBuildingCost(buildingType, level);

        // In a real scenario, resource deduction would happen here or in a service layer
        // For now, we assume resources are checked/deducted before calling this.
        // if (!ResourceManager.hasEnough(village.resources, cost)) {
        //     throw new Error("Insufficient resources for building");
        // }
        // village.resources = ResourceManager.deductResources(village.resources, cost);

        if (village.build_queue.length >= this.MAX_SLOTS) {
            // Check if the building type is already in the queue and if it's at max level
            const existingTask = village.build_queue.find(task => task.building_type === buildingType);
            if (existingTask && existingTask.level >= GameBalanceCalculator.getBuildingMaxLevel(buildingType)) {
                throw new Error(`Building ${buildingType} is already at max level or in queue to reach max level.`);
            }
            throw new Error("Build queue is full (Max 3 slots)");
        }

        let startTime = currentTime;
        if (village.build_queue.length > 0) {
            // Start after the last item in queue
            startTime = village.build_queue[village.build_queue.length - 1].end_time;
        }

        const newTask = {
            building_type: buildingType,
            level: level,
            start_time: startTime,
            end_time: startTime + durationMs
        };

        return [...village.build_queue, newTask];
    }
}

module.exports = BuildQueueManager;
