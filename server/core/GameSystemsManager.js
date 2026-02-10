/**
 * FERRUM MMO - Game Systems Manager
 * Handles Events, Monetization, and Player Flow logic.
 */

class GameSystemsManager {
    /**
     * Define available game events.
     */
    static EVENTS = [
        { id: 'pve_boss', name: 'Weekendowy Boss', type: 'combat', frequency: 'weekly' },
        { id: 'treasure_village', name: 'Wioska Skarbów', type: 'exploration', frequency: 'daily' },
        { id: 'plague', name: 'Plaga', type: 'economic_penalty', frequency: 'random' },
        { id: 'revolt', name: 'Bunt', type: 'loyalty_penalty', frequency: 'random' }
    ];

    /**
     * Define monetization options (Non-P2W).
     */
    static MONETIZATION = {
        premium_account: {
            name: 'Konto Premium',
            benefits: ['+2 sloty budowy', '+10% produkcji', 'Zaawansowane raporty'],
            price_credits: 500
        },
        lord_cosmetics: {
            name: 'Kosmetyka Lorda',
            items: ['Złota Zbroja', 'Tytuł: Zdobywca', 'Unikalny Sztandar'],
            price_credits: 200
        },
        accelerators: {
            name: 'Przyspieszacze',
            effect: 'Skrócenie czasu o 25%',
            limit: 'Max 3 dziennie',
            price_credits: 50
        }
    };

    /**
     * Initialize player tutorial flow.
     */
    static getTutorialSteps() {
        return [
            { step: 1, title: 'Witaj w Ferrum', action: 'view_city' },
            { step: 2, title: 'Pierwsze Surowce', action: 'upgrade_building', target: 'woodcutter', level: 2 },
            { step: 3, title: 'Werbunek', action: 'recruit_unit', target: 'spearman', count: 5 },
            { step: 4, title: 'Pierwszy Zwiad', action: 'send_scout', target: 'barbarian_village' },
            { step: 5, title: 'Chwała i Ekspansja', action: 'attack_village', target: 'barbarian_village' }
        ];
    }
}

module.exports = GameSystemsManager;
