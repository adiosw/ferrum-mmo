/**
 * FERRUM MMO - Dynasty Manager (Expanded)
 * Handles Lord generation, DNA inheritance, traits, flaws, and mutations.
 */

class DynastyManager {
    static TRAITS = [
        { id: 'engineer', name: 'Inżynier', effect: 'building_speed', value: 0.15 },
        { id: 'tax_collector', name: 'Poborca', effect: 'tax_bonus', value: 0.15 },
        { id: 'tactician', name: 'Taktyk', effect: 'combat_bonus', value: 0.10 },
        { id: 'architect', name: 'Architekt', effect: 'wall_bonus', value: 0.20 },
        { id: 'merchant', name: 'Kupiec', effect: 'trade_efficiency', value: 0.15 },
        { id: 'farmer', name: 'Rolnik', effect: 'grain_production', value: 0.20 },
        { id: 'miner', name: 'Górnik', effect: 'stone_iron_production', value: 0.15 },
        { id: 'forester', name: 'Leśniczy', effect: 'wood_production', value: 0.15 },
        { id: 'builder', name: 'Budowniczy', effect: 'construction_cost_reduction', value: 0.10 },
        { id: 'commander', name: 'Dowódca', effect: 'unit_attack', value: 0.10 },
        { id: 'defender', name: 'Obrońca', effect: 'unit_defense', value: 0.10 },
        { id: 'trainer', name: 'Trener', effect: 'recruitment_speed', value: 0.15 },
        { id: 'siege_master', name: 'Mistrz Oblężeń', effect: 'siege_effectiveness', value: 0.20 },
        { id: 'scout_master', name: 'Mistrz Zwiadu', effect: 'scout_speed', value: 0.25 },
        { id: 'diplomat', name: 'Dyplomata', effect: 'vassal_tribute', value: 0.05 },
        { id: 'charismatic', name: 'Charyzmatyczny', effect: 'loyalty_gain', value: 0.10 },
        { id: 'negotiator', name: 'Negocjator', effect: 'ransom_reduction', value: 0.15 },
        { id: 'inventor', name: 'Wynalazca', effect: 'research_speed', value: 0.10 },
        { id: 'healer', name: 'Uzdrowiciel', effect: 'unit_recovery', value: 0.15 },
        { id: 'scholar', name: 'Uczony', effect: 'exp_gain', value: 0.20 }
    ];

    static FLAWS = [
        { id: 'sickly', name: 'Chorowity', effect: 'life_span', value: -0.20 },
        { id: 'greedy', name: 'Chciwy', effect: 'morale_penalty', value: -0.10 },
        { id: 'spendthrift', name: 'Rozrzutny', effect: 'resource_income', value: -0.10 },
        { id: 'lazy', name: 'Leniwy', effect: 'production_speed', value: -0.15 },
        { id: 'corrupt', name: 'Zkorumpowany', effect: 'tax_penalty', value: -0.15 },
        { id: 'cowardly', name: 'Tchórzliwy', effect: 'unit_morale', value: -0.20 },
        { id: 'rash', name: 'Porywczy', effect: 'unit_losses', value: 0.10 },
        { id: 'slow', name: 'Powolny', effect: 'unit_speed', value: -0.10 },
        { id: 'tyrant', name: 'Tyran', effect: 'loyalty_penalty', value: -0.15 },
        { id: 'weak_willed', name: 'Słaba Wola', effect: 'vassal_rebellion_chance', value: 0.10 },
        { id: 'unlucky', name: 'Pechowiec', effect: 'event_luck', value: -0.20 }
    ];

    static generateDNA() {
        return Math.random().toString(36).substring(2, 15).toUpperCase();
    }

    static createLord(name, dna = null) {
        const trait = this.TRAITS[Math.floor(Math.random() * this.TRAITS.length)];
        const flaw = Math.random() > 0.6 ? this.FLAWS[Math.floor(Math.random() * this.FLAWS.length)] : null;
        
        return {
            name: name,
            dna_id: dna || this.generateDNA(),
            traits: [trait],
            flaws: flaw ? [flaw] : [],
            birth_date: Date.now(),
            death_date: Date.now() + (60 * 24 * 60 * 60 * 1000) // 60 days base
        };
    }

    static inherit(parentLord, successorName) {
        // Inherit 1 trait from parent
        const inheritedTrait = parentLord.traits[Math.floor(Math.random() * parentLord.traits.length)];
        
        // Roll for mutation (10% chance for a completely new trait)
        let newTrait;
        if (Math.random() < 0.10) {
            newTrait = this.TRAITS[Math.floor(Math.random() * this.TRAITS.length)];
        } else {
            const availableTraits = this.TRAITS.filter(t => !parentLord.traits.some(pt => pt.id === t.id));
            newTrait = availableTraits[Math.floor(Math.random() * availableTraits.length)];
        }

        const successor = this.createLord(successorName, parentLord.dna_id);
        successor.traits = [inheritedTrait, newTrait];
        
        // Flaws also have a chance to be inherited
        if (parentLord.flaws.length > 0 && Math.random() < 0.5) {
            successor.flaws = [parentLord.flaws[0]];
        }

        return successor;
    }
}

module.exports = DynastyManager;
