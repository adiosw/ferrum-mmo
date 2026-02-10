import { useCallback } from 'react';

const API_BASE = '/api';

export const useGameAPI = () => {
  const getState = useCallback(async (playerId: string) => {
    const response = await fetch(`${API_BASE}/state?player_id=${playerId}`);
    return response.json();
  }, []);

  const buildStructure = useCallback(
    async (playerId: string, villageId: string, buildingType: string, level: number) => {
      const response = await fetch(`${API_BASE}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId, village_id: villageId, building_type: buildingType, level }),
      });
      return response.json();
    },
    []
  );

  const recruitUnits = useCallback(
    async (playerId: string, villageId: string, unitType: string, count: number) => {
      const response = await fetch(`${API_BASE}/recruit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId, village_id: villageId, unit_type: unitType, count }),
      });
      return response.json();
    },
    []
  );

  const sendArmy = useCallback(
    async (playerId: string, villageId: string, targetX: number, targetY: number, units: Record<string, number>) => {
      const response = await fetch(`${API_BASE}/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId, village_id: villageId, target_x: targetX, target_y: targetY, units }),
      });
      return response.json();
    },
    []
  );

  const sendScout = useCallback(
    async (playerId: string, targetX: number, targetY: number) => {
      const response = await fetch(`${API_BASE}/scout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId, target_x: targetX, target_y: targetY }),
      });
      return response.json();
    },
    []
  );

  const saveGame = useCallback(
    async (playerId: string, state: any) => {
      const response = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId, state }),
      });
      return response.json();
    },
    []
  );

  return {
    getState,
    buildStructure,
    recruitUnits,
    sendArmy,
    sendScout,
    saveGame,
  };
};
