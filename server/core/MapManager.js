/**
 * FERRUM MMO - Map Manager
 * Handles 100x100 grid logic, distance calculations, and marching times.
 */

class MapManager {
    static GRID_SIZE = 100;

    /**
     * Calculate Euclidean distance between two points.
     */
    static calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    /**
     * Calculate travel time based on distance and slowest unit speed.
     * @param {number} distance - Distance in grid units
     * @param {number} slowestSpeed - Speed of the slowest unit in the army
     * @returns {number} Travel time in milliseconds
     */
    static calculateTravelTime(distance, slowestSpeed) {
        // Formula: Time (ms) = (Distance / Speed) * Constant
        // Constant 3600000 means speed is in "grid units per hour"
        const speedPerHour = slowestSpeed; 
        const timeHours = distance / speedPerHour;
        return Math.floor(timeHours * 3600 * 1000);
    }

    /**
     * Generate a random coordinate within the grid.
     */
    static getRandomCoordinate() {
        return {
            x: Math.floor(Math.random() * this.GRID_SIZE),
            y: Math.floor(Math.random() * this.GRID_SIZE)
        };
    }

    /**
     * Check if a coordinate is within a specific zone (e.g., Start Zone).
     */
    static isInStartZone(x, y) {
        // Example: Start zones are corners of the map
        const margin = 20;
        const inTopLeft = x < margin && y < margin;
        const inTopRight = x > (this.GRID_SIZE - margin) && y < margin;
        const inBottomLeft = x < margin && y > (this.GRID_SIZE - margin);
        const inBottomRight = x > (this.GRID_SIZE - margin) && y > (this.GRID_SIZE - margin);
        
        return inTopLeft || inTopRight || inBottomLeft || inBottomRight;
    }
}

module.exports = MapManager;
