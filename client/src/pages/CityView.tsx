import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import GameLayout from "@/components/GameLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Hammer, Zap } from "lucide-react";

const BUILDINGS = [
  { id: "woodcutter", name: "Tartak", icon: "🌲", production: "Drewno" },
  { id: "stone_mine", name: "Kamieniołom", icon: "⛏️", production: "Kamień" },
  { id: "iron_mine", name: "Kopalnia Żelaza", icon: "⚒️", production: "Żelazo" },
  { id: "farm", name: "Farma", icon: "🌾", production: "Zboże" },
  { id: "barracks", name: "Koszary", icon: "⚔️", production: "Jednostki" },
  { id: "stables", name: "Stajnie", icon: "🐴", production: "Kawaleria" },
  { id: "workshop", name: "Warsztat", icon: "🔧", production: "Maszyny" },
  { id: "wall", name: "Mur", icon: "🏰", production: "Obrona" },
  { id: "storage", name: "Magazyn", icon: "📦", production: "Pojemność" },
  { id: "market", name: "Rynek", icon: "🏪", production: "Handel" },
  { id: "academy", name: "Akademia", icon: "📚", production: "Badania" },
  { id: "temple", name: "Świątynia", icon: "⛪", production: "Morale" },
];

interface Building {
  id: string;
  type: string;
  level: number;
  nextUpgradeTime?: number;
}

interface BuildQueueItem {
  buildingType: string;
  level: number;
  endTime: number;
}

export default function CityView() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildQueue, setBuildQueue] = useState<BuildQueueItem[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  // Fetch game state
  const { data: gameState } = trpc.game.getGameState.useQuery();
  const buildMutation = trpc.game.startBuild.useMutation();

  useEffect(() => {
    if (gameState?.villages && gameState.villages.length > 0) {
      const village = gameState.villages[0];
      // Parse buildings from village data
      setBuildings([]);
    }
  }, [gameState]);

  const getQueueProgress = (item: BuildQueueItem) => {
    const now = Date.now();
    const total = item.endTime - (item.endTime - 60000);
    const elapsed = now - (item.endTime - 60000);
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const villageId = gameState?.villages?.[0]?.id || "";

  return (
    <GameLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h2 className="text-3xl font-bold text-amber-500 mb-2">Twoje Miasto</h2>
          <p className="text-slate-400">Zarządzaj budynkami i zasobami</p>
        </div>

        {/* Build Queue */}
        {buildQueue.length > 0 && (
          <Card className="bg-slate-900/50 border-amber-700/30 p-4">
            <h3 className="text-lg font-semibold text-amber-500 mb-3 flex items-center gap-2">
              <Hammer size={20} />
              Kolejka Budowy
            </h3>
            <div className="space-y-3">
              {buildQueue.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">
                      {BUILDINGS.find(b => b.id === item.buildingType)?.name} Lvl {item.level}
                    </span>
                    <span className="text-amber-400">{Math.round(getQueueProgress(item))}%</span>
                  </div>
                  <Progress value={getQueueProgress(item)} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Buildings Grid */}
        <div>
          <h3 className="text-xl font-semibold text-amber-500 mb-4 flex items-center gap-2">
            <Zap size={20} />
            Budynki
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUILDINGS.map((building) => {
              const playerBuilding = buildings.find(b => b.type === building.id);
              const level = playerBuilding?.level || 0;
              const isUpgrading = buildQueue.some(q => q.buildingType === building.id);

              return (
                <Card
                  key={building.id}
                  className={`p-4 cursor-pointer transition-all hover:border-amber-500/50 ${
                    selectedBuilding === building.id
                      ? "border-amber-500 bg-amber-900/20"
                      : "border-amber-700/30 bg-slate-900/50 hover:bg-slate-900/70"
                  }`}
                  onClick={() => setSelectedBuilding(building.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{building.icon}</span>
                      <div>
                        <h4 className="font-semibold text-slate-100">{building.name}</h4>
                        <p className="text-xs text-slate-400">Lvl {level}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">{building.production}</p>

                  {isUpgrading ? (
                    <div className="space-y-1">
                      <Progress value={50} className="h-1" />
                      <p className="text-xs text-amber-400 text-center">Budowanie...</p>
                    </div>
                  ) : (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuild(building.id);
                      }}
                      size="sm"
                      className="w-full bg-amber-700 hover:bg-amber-600 text-white"
                      disabled={buildMutation.isPending}
                    >
                      {level === 0 ? "Zbuduj" : "Ulepszy"}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Building Details */}
        {selectedBuilding && (
          <Card className="bg-slate-900/50 border-amber-700/30 p-6">
            <h3 className="text-xl font-semibold text-amber-500 mb-4">
              {BUILDINGS.find(b => b.id === selectedBuilding)?.name}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Koszt Budowy:</p>
                <p className="text-amber-400 font-semibold">Drewno: 500, Kamień: 300</p>
              </div>
              <div>
                <p className="text-slate-400">Czas Budowy:</p>
                <p className="text-amber-400 font-semibold">5 minut</p>
              </div>
              <div>
                <p className="text-slate-400">Produkcja:</p>
                <p className="text-amber-400 font-semibold">+50 surowca/godzinę</p>
              </div>
              <div>
                <p className="text-slate-400">Populacja:</p>
                <p className="text-amber-400 font-semibold">-10 mieszkańców</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </GameLayout>
  );

  function handleBuild(buildingId: string) {
    buildMutation.mutate({
      villageId,
      buildingType: buildingId,
    });
  }
}
