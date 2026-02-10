import express, { Request, Response } from 'express';

// Import game logic modules
const gameState: Record<string, any> = {};

const router = express.Router();

/**
 * GET /api/state
 * Returns current game state
 */
router.get('/state', (req: Request, res: Response) => {
  const playerId = req.query.player_id as string || 'player_1';
  
  if (!gameState[playerId]) {
    gameState[playerId] = {
      player_id: playerId,
      villages: [
        {
          id: 'village_1',
          name: 'Główna Wioska',
          x: 50,
          y: 50,
          owner_id: playerId,
          resources: {
            wood: 1000,
            stone: 500,
            iron: 200,
            grain: 1500,
            last_update: Date.now(),
          },
          production: {
            wood: 50,
            stone: 40,
            iron: 20,
            grain: 100,
          },
          buildings: {
            town_hall: 1,
            woodcutter: 1,
            quarry: 1,
            iron_mine: 1,
            farm: 1,
            warehouse: 1,
            barracks: 0,
            stable: 0,
            workshop: 0,
            walls: 0,
            market: 0,
            academy: 0,
          },
          build_queue: [],
          population: 50,
          loyalty: 100,
        },
      ],
      armies: [],
      lord: {
        name: 'Twój Władca',
        dna_id: 'DNA_' + Math.random().toString(36).substr(2, 9),
        traits: ['commander'],
        flaws: [],
        birth_date: Date.now(),
        death_date: Date.now() + 60 * 24 * 60 * 60 * 1000,
      },
      reports: [],
      tutorial_step: 0,
      game_time: Date.now(),
    };
  }

  res.json(gameState[playerId]);
});

/**
 * POST /api/build
 * Start building a structure
 */
router.post('/build', (req: Request, res: Response) => {
  const { player_id, village_id, building_type, level } = req.body;
  
  if (!gameState[player_id]) {
    return res.status(404).json({ error: 'Player not found' });
  }

  const village = gameState[player_id].villages.find((v: any) => v.id === village_id);
  if (!village) {
    return res.status(404).json({ error: 'Village not found' });
  }

  // Simple cost calculation
  const baseCost = 100;
  const costMultiplier = 1.2;
  const currentLevel = village.buildings[building_type] || 0;
  const cost = Math.floor(baseCost * Math.pow(costMultiplier, currentLevel));

  if (village.resources.wood < cost) {
    return res.status(400).json({ error: 'Insufficient resources' });
  }

  // Deduct resources
  village.resources.wood -= cost;

  // Add to build queue
  const buildTime = 300 + currentLevel * 60; // seconds
  village.build_queue.push({
    building_type,
    level: currentLevel + 1,
    start_time: Date.now(),
    end_time: Date.now() + buildTime * 1000,
  });

  res.json({ success: true, end_time: Date.now() + buildTime * 1000 });
});

/**
 * POST /api/recruit
 * Recruit units
 */
router.post('/recruit', (req: Request, res: Response) => {
  const { player_id, village_id, unit_type, count } = req.body;

  if (!gameState[player_id]) {
    return res.status(404).json({ error: 'Player not found' });
  }

  const village = gameState[player_id].villages.find((v: any) => v.id === village_id);
  if (!village) {
    return res.status(404).json({ error: 'Village not found' });
  }

  // Simple unit cost
  const unitCosts: Record<string, Record<string, number>> = {
    spearman: { wood: 50, grain: 30 },
    swordsman: { wood: 80, iron: 20, grain: 40 },
    archer: { wood: 60, iron: 10, grain: 30 },
    cavalry: { wood: 100, iron: 40, grain: 60 },
  };

  const cost = unitCosts[unit_type];
  if (!cost) {
    return res.status(400).json({ error: 'Unknown unit type' });
  }

  // Check resources
  for (const [resource, amount] of Object.entries(cost)) {
    if ((village.resources as any)[resource] < amount * count) {
      return res.status(400).json({ error: `Insufficient ${resource}` });
    }
  }

  // Deduct resources
  for (const [resource, amount] of Object.entries(cost)) {
    (village.resources as any)[resource] -= amount * count;
  }

  // Add recruitment time
  const recruitTime = 60 + count * 10; // seconds
  village.population += count;

  res.json({ success: true, end_time: Date.now() + recruitTime * 1000 });
});

/**
 * POST /api/attack
 * Send army to attack
 */
router.post('/attack', (req: Request, res: Response) => {
  const { player_id, village_id, target_x, target_y, units } = req.body;

  if (!gameState[player_id]) {
    return res.status(404).json({ error: 'Player not found' });
  }

  const village = gameState[player_id].villages.find((v: any) => v.id === village_id);
  if (!village) {
    return res.status(404).json({ error: 'Village not found' });
  }

  // Calculate march time (simple distance-based)
  const dx = target_x - village.x;
  const dy = target_y - village.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const marchTime = Math.ceil(distance * 60); // seconds

  const army = {
    id: 'army_' + Math.random().toString(36).substr(2, 9),
    village_id,
    units,
    location: { x: village.x, y: village.y },
    target: { x: target_x, y: target_y },
    arrival_time: Date.now() + marchTime * 1000,
    status: 'marching',
  };

  gameState[player_id].armies.push(army);

  res.json({ success: true, army_id: army.id, arrival_time: army.arrival_time });
});

/**
 * POST /api/scout
 * Send scout to gather intelligence
 */
router.post('/scout', (req: Request, res: Response) => {
  const { player_id, target_x, target_y } = req.body;

  if (!gameState[player_id]) {
    return res.status(404).json({ error: 'Player not found' });
  }

  // Simple scout report
  const report = {
    target: { x: target_x, y: target_y },
    units: Math.floor(Math.random() * 100),
    resources: {
      wood: Math.floor(Math.random() * 500),
      stone: Math.floor(Math.random() * 300),
      iron: Math.floor(Math.random() * 100),
      grain: Math.floor(Math.random() * 800),
    },
  };

  res.json({ success: true, report });
});

/**
 * POST /api/save
 * Save game state
 */
router.post('/save', (req: Request, res: Response) => {
  const { player_id, state } = req.body;
  gameState[player_id] = state;
  res.json({ success: true });
});

export default router;
