/**
 * FERRUM MMO - Economy Manager
 * Handles resources, prisoners, and vassalization logic.
 */

class EconomyManager {
    /**
     * Create a vassal relationship.
     * @param {string} lordId - The Suzerain (Winner)
     * @param {string} vassalId - The Vassal (Loser)
     * @param {number} ransomAmount - Total amount to pay for freedom
     */
    static createVassalage(lordId, vassalId, ransomAmount) {
        return {
            suzerain_id: lordId,
            vassal_id: vassalId,
            tribute_rate: 0.10, // 10% of production
            total_ransom: ransomAmount,
            paid_ransom: 0,
            status: 'active'
        };
    }

    /**
     * Calculate tribute to be paid by vassal.
     */
    static calculateTribute(vassalProduction) {
        const tribute = {};
        for (let res in vassalProduction) {
            tribute[res] = Math.floor(vassalProduction[res] * 0.10);
        }
        return tribute;
    }

    /**
     * Process a ransom payment installment.
     */
    static payRansom(vassalage, amount) {
        vassalage.paid_ransom += amount;
        if (vassalage.paid_ransom >= vassalage.total_ransom) {
            vassalage.status = 'free';
            return true; // Freed
        }
        return false; // Still vassal
    }

    /**
     * Handle prisoners (Jeńcy) from battle.
     */
    static capturePrisoners(attackerLosses, defenderLosses) {
        // 5% of total losses become prisoners
        const totalLosses = Object.values(attackerLosses).reduce((a,b) => a+b, 0) + 
                            Object.values(defenderLosses).reduce((a,b) => a+b, 0);
        return Math.floor(totalLosses * 0.05);
    }
}

module.exports = EconomyManager;
