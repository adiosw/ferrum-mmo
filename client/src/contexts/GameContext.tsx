import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Village {
  id: string;
  name: string;
  x: number;
  y: number;
  owner_id: string;
  resources: {
    wood: number;
    stone: number;
    iron: number;
    grain: number;
    last_update: number;
  };
  production: {
    wood: number;
    stone: number;
    iron: number;
    grain: number;
  };
  buildings: Record<string, number>;
  build_queue: Array<{
    building_type: string;
    level: number;
    start_time: number;
    end_time: number;
  }>;
  population: number;
  loyalty: number;
}

export interface Lord {
  name: string;
  dna_id: string;
  traits: string[];
  flaws: string[];
  birth_date: number;
  death_date: number;
}

export interface Army {
  id: string;
  village_id: string;
  units: Record<string, number>;
  location: { x: number; y: number };
  target?: { x: number; y: number };
  arrival_time?: number;
  status: 'idle' | 'marching' | 'attacking';
}

export interface GameState {
  player_id: string;
  villages: Village[];
  armies: Army[];
  lord: Lord;
  reports: any[];
  tutorial_step: number;
  game_time: number;
}

interface GameContextType {
  gameState: GameState | null;
  setGameState: (state: GameState) => void;
  updateResources: (villageId: string, resources: Partial<Village['resources']>) => void;
  addBuildTask: (villageId: string, building: string, level: number, endTime: number) => void;
  recruitUnits: (villageId: string, unitType: string, count: number, endTime: number) => void;
  sendArmy: (villageId: string, units: Record<string, number>, targetX: number, targetY: number) => void;
  processGameTick: () => void;
  saveGame: () => void;
  loadGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Initialize game on mount
  useEffect(() => {
    const saved = localStorage.getItem('ferrum_game_state');
    if (saved) {
      try {
        setGameState(JSON.parse(saved));
      } catch {
        initializeNewGame();
      }
    } else {
      initializeNewGame();
    }
  }, []);

  const initializeNewGame = () => {
    const newState: GameState = {
      player_id: 'player_' + Math.random().toString(36).substr(2, 9),
      villages: [
        {
          id: 'village_1',
          name: 'Główna Wioska',
          x: 50,
          y: 50,
          owner_id: 'player_1',
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
    setGameState(newState);
    localStorage.setItem('ferrum_game_state', JSON.stringify(newState));
  };

  const updateResources = useCallback((villageId: string, resources: Partial<Village['resources']>) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        villages: prev.villages.map((v) =>
          v.id === villageId ? { ...v, resources: { ...v.resources, ...resources } } : v
        ),
      };
    });
  }, []);

  const addBuildTask = useCallback(
    (villageId: string, building: string, level: number, endTime: number) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          villages: prev.villages.map((v) =>
            v.id === villageId
              ? {
                  ...v,
                  build_queue: [
                    ...v.build_queue,
                    {
                      building_type: building,
                      level,
                      start_time: Date.now(),
                      end_time: endTime,
                    },
                  ],
                }
              : v
          ),
        };
      });
    },
    []
  );

  const recruitUnits = useCallback(
    (villageId: string, unitType: string, count: number, endTime: number) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          villages: prev.villages.map((v) =>
            v.id === villageId
              ? {
                  ...v,
                  population: v.population + count,
                }
              : v
          ),
        };
      });
    },
    []
  );

  const sendArmy = useCallback(
    (villageId: string, units: Record<string, number>, targetX: number, targetY: number) => {
      setGameState((prev) => {
        if (!prev) return prev;
        const newArmy: Army = {
          id: 'army_' + Math.random().toString(36).substr(2, 9),
          village_id: villageId,
          units,
          location: { x: 50, y: 50 },
          target: { x: targetX, y: targetY },
          arrival_time: Date.now() + 60000,
          status: 'marching',
        };
        return {
          ...prev,
          armies: [...prev.armies, newArmy],
        };
      });
    },
    []
  );

  const processGameTick = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      const now = Date.now();

      // Update resources
      const updatedVillages = prev.villages.map((v) => {
        const elapsed = (now - v.resources.last_update) / 3600000; // hours
        return {
          ...v,
          resources: {
            ...v.resources,
            wood: Math.floor(v.resources.wood + v.production.wood * elapsed),
            stone: Math.floor(v.resources.stone + v.production.stone * elapsed),
            iron: Math.floor(v.resources.iron + v.production.iron * elapsed),
            grain: Math.floor(v.resources.grain + v.production.grain * elapsed),
            last_update: now,
          },
          build_queue: v.build_queue.filter((task) => task.end_time > now),
          buildings: {
            ...v.buildings,
            ...Object.fromEntries(
              v.build_queue
                .filter((task) => task.end_time <= now)
                .map((task) => [task.building_type, task.level])
            ),
          },
        };
      });

      // Update armies
      const updatedArmies = prev.armies
        .map((a) => {
          if (a.arrival_time && a.arrival_time <= now && a.target) {
            return { ...a, location: a.target, status: 'idle' as const };
          }
          return a;
        })
        .filter((a) => a.status !== 'idle' || a.location.x !== a.target?.x || a.location.y !== a.target?.y);

      return {
        ...prev,
        villages: updatedVillages,
        armies: updatedArmies,
        game_time: now,
      };
    });
  }, []);

  const saveGame = useCallback(() => {
    if (gameState) {
      localStorage.setItem('ferrum_game_state', JSON.stringify(gameState));
    }
  }, [gameState]);

  const loadGame = useCallback(() => {
    const saved = localStorage.getItem('ferrum_game_state');
    if (saved) {
      try {
        setGameState(JSON.parse(saved));
      } catch {
        console.error('Failed to load game');
      }
    }
  }, []);

  const value: GameContextType = {
    gameState,
    setGameState,
    updateResources,
    addBuildTask,
    recruitUnits,
    sendArmy,
    processGameTick,
    saveGame,
    loadGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
