import React, { useState } from 'react';
import { Village, useGame } from '@/contexts/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGameAPI } from '@/hooks/useGameAPI';
import { toast } from 'sonner';

interface CityViewProps {
  village: Village;
}

const BUILDINGS: Record<string, { name: string; icon: string }> = {
  town_hall: { name: 'Ratusz', icon: '🏰' },
  woodcutter: { name: 'Chata Drwala', icon: '🪵' },
  quarry: { name: 'Kamieniołom', icon: '⛏️' },
  iron_mine: { name: 'Kopalnia Żelaza', icon: '🔨' },
  farm: { name: 'Gospodarstwo', icon: '🌾' },
  warehouse: { name: 'Spichlerz', icon: '📦' },
  barracks: { name: 'Koszary', icon: '⚔️' },
  stable: { name: 'Stajnia', icon: '🐴' },
  workshop: { name: 'Warsztat', icon: '🛠️' },
  walls: { name: 'Mury Obronne', icon: '🧱' },
  market: { name: 'Rynek', icon: '🏪' },
  academy: { name: 'Akademia', icon: '📚' },
};

export default function CityView({ village }: CityViewProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const { gameState, addBuildTask } = useGame();
  const { buildStructure } = useGameAPI();

  const handleBuild = async (buildingType: string) => {
    if (!gameState) return;
    try {
      const result = await buildStructure(gameState.player_id, village.id, buildingType, (village.buildings[buildingType] || 0) + 1);
      if (result.success) {
        addBuildTask(village.id, buildingType, (village.buildings[buildingType] || 0) + 1, result.end_time);
        toast.success(`Budowa ${BUILDINGS[buildingType as keyof typeof BUILDINGS]?.name} rozpoczęta!`);
      } else {
        toast.error(result.error || 'Błąd budowy');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  return (
    <div className="space-y-6">
      {/* Resources */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">{village.resources.wood}</p>
              <p className="text-sm text-slate-400">Drewno</p>
              <p className="text-xs text-slate-500">+{village.production.wood}/h</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">{village.resources.stone}</p>
              <p className="text-sm text-slate-400">Kamień</p>
              <p className="text-xs text-slate-500">+{village.production.stone}/h</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{village.resources.iron}</p>
              <p className="text-sm text-slate-400">Żelazo</p>
              <p className="text-xs text-slate-500">+{village.production.iron}/h</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{village.resources.grain}</p>
              <p className="text-sm text-slate-400">Zboże</p>
              <p className="text-xs text-slate-500">+{village.production.grain}/h</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Population & Loyalty */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-400 mb-2">Populacja</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-700 rounded h-2">
                  <div
                    className="bg-green-500 h-2 rounded"
                    style={{ width: `${(village.population / 500) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold">{village.population}/500</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-400 mb-2">Lojalność</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-700 rounded h-2">
                  <div
                    className="bg-blue-500 h-2 rounded"
                    style={{ width: `${village.loyalty}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold">{village.loyalty}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Build Queue */}
      {village.build_queue.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Kolejka Budowy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {village.build_queue.map((task, idx) => (
              <div key={idx} className="bg-slate-700 p-3 rounded">
                <p className="text-sm font-bold">{BUILDINGS[task.building_type as keyof typeof BUILDINGS]?.name} Lv.{task.level}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-slate-600 rounded h-2">
                    <div
                      className="bg-amber-500 h-2 rounded"
                      style={{
                        width: `${Math.min(100, ((Date.now() - task.start_time) / (task.end_time - task.start_time)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {Math.max(0, Math.ceil((task.end_time - Date.now()) / 1000))}s
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Buildings */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">Budynki</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(BUILDINGS).map(([key, building]) => (
              <Dialog key={key}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 bg-slate-700 border-slate-600 hover:bg-slate-600"
                  >
                    <span className="text-2xl">{building.icon}</span>
                    <span className="text-xs text-center">{building.name}</span>
                    <span className="text-xs font-bold text-amber-500">Lv.{village.buildings[key] || 0}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle>{building.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-400">Obecny poziom: {village.buildings[key] || 0}</p>
                    <p className="text-sm">Koszt następnego poziomu:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Drewno: 100</div>
                      <div>Kamień: 50</div>
                      <div>Żelazo: 20</div>
                      <div>Czas: 5m</div>
                    </div>
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={() => handleBuild(key)}
                    >
                      Buduj
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
