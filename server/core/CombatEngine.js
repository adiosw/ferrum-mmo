/**
 * FERRUM MMO - Combat Engine
 * Handles battle logic, tactics (Rock-Paper-Scissors), and formations.
 */

class CombatEngine {
    static TACTICS = {
        KLIN: 'Klin',
        MUR_TARCZ: 'Mur Tarcz',
        DESZCZ_STRZAL: 'Deszcz Strzał',
        ZASADZKA: 'Zasadzka'
    };

    // Rock-Paper-Scissors logic: Key beats Value
    static TACTIC_COUNTERS = {
        'Klin': 'Mur Tarcz',
        'Mur Tarcz': 'Deszcz Strzał',
        'Deszcz Strzał': 'Zasadzka',
        'Zasadzka': 'Klin'
    };

    /**
     * Execute battle between attacker and defender.
     */
    static executeBattle(attacker, defender, attackerTactic, defenderTactic) {
        let attackerPower = this.calculatePower(attacker.units);
        let defenderPower = this.calculatePower(defender.units);

        // Apply Wall Bonus
        const wallBonus = 1 + (defender.wall_level * 0.10);
        defenderPower *= wallBonus;

        // Apply Tactics Bonus (+20% if counter)
        let report = {
            attacker_tactic: attackerTactic,
            defender_tactic: defenderTactic,
            bonuses: []
        };

        if (this.TACTIC_COUNTERS[attackerTactic] === defenderTactic) {
            attackerPower *= 1.20;
            report.bonuses.push("Atakujący skontrował taktykę obrońcy! (+20% siły)");
        } else if (this.TACTIC_COUNTERS[defenderTactic] === attackerTactic) {
            defenderPower *= 1.20;
            report.bonuses.push("Obrońca skontrował taktykę atakującego! (+20% siły)");
        }

        // Battle Result
        const totalPower = attackerPower + defenderPower;
        const attackerWinChance = attackerPower / totalPower;
        const winner = Math.random() < attackerWinChance ? 'attacker' : 'defender';

        // Losses calculation (simplified: loser loses 60-80%, winner loses 20-40%)
        const attackerLossRate = winner === 'attacker' ? 0.3 : 0.7;
        const defenderLossRate = winner === 'defender' ? 0.3 : 0.7;

        const attackerLosses = this.applyLosses(attacker.units, attackerLossRate);
        const defenderLosses = this.applyLosses(defender.units, defenderLossRate);

        // Morale & Desertion
        let desertion = 0;
        if (winner === 'defender' && Math.random() < 0.5) { // Low morale for defeated attacker
            desertion = Math.floor(this.countTotalUnits(attacker.units) * 0.10);
        }

        return {
            winner,
            attacker_losses: attackerLosses,
            defender_losses: defenderLosses,
            desertion,
            report: report.bonuses,
            loyalty_change: winner === 'attacker' ? -25 : 0
        };
    }

    static calculatePower(units) {
        return (units.infantry * 10) + (units.cavalry * 25) + (units.rams * 5) + (units.catapults * 15);
    }

    static applyLosses(units, rate) {
        const losses = {};
        for (let unit in units) {
            losses[unit] = Math.floor(units[unit] * rate);
        }
        return losses;
    }

    static countTotalUnits(units) {
        return Object.values(units).reduce((a, b) => a + b, 0);
    }
}

module.exports = CombatEngine;
