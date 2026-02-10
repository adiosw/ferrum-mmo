import { useState } from "react";
import { trpc } from "@/lib/trpc";
import GameLayout from "@/components/GameLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sword, Clock, Users } from "lucide-react";

const UNIT_TYPES = [
  { id: "spearman", name: "Włócznik", icon: "🗡️", attack: 5, defense: 4, speed: 6 },
  { id: "swordsman", name: "Mieczy", icon: "⚔️", attack: 8, defense: 5, speed: 5 },
  { id: "archer", name: "Łucznik", icon: "🏹", attack: 6, defense: 3, speed: 7 },
  { id: "cavalry", name: "Kawaleria", icon: "🐴", attack: 10, defense: 6, speed: 9 },
  { id: "ram", name: "Taran", icon: "🪵", attack: 4, defense: 8, speed: 3 },
  { id: "catapult", name: "Katapulta", icon: "🎯", attack: 12, defense: 4, speed: 2 },
  { id: "herald", name: "Herold", icon: "📯", attack: 2, defense: 2, speed: 10 },
];

const TACTICS = [
  { id: "klin", name: "Klin", description: "Przebij linię obrony" },
  { id: "mur", name: "Mur Tarcz", description: "Maksymalna obrona" },
  { id: "deszcz", name: "Deszcz Strzał", description: "Atakuj z dystansu" },
  { id: "zasadzka", name: "Zasadzka", description: "Zaatakuj z boku" },
];

export default function ArmyManagement() {
  const [selectedUnits, setSelectedUnits] = useState<Record<string, number>>({});
  const [selectedTactic, setSelectedTactic] = useState("klin");
  const [targetCoords, setTargetCoords] = useState({ x: 0, y: 0 });

  const { data: gameState } = trpc.game.getGameState.useQuery();
  const { data: armies } = trpc.game.getBattleReports.useQuery();
  const sendArmyMutation = trpc.game.sendArmy.useMutation();

  const handleUnitChange = (unitId: string, count: number) => {
    setSelectedUnits((prev) => ({
      ...prev,
      [unitId]: Math.max(0, count),
    }));
  };

  const handleSendArmy = async () => {
    const villageId = gameState?.villages?.[0]?.id;
    if (!villageId) return;

    try {
      await sendArmyMutation.mutateAsync({
        villageId,
        targetX: targetCoords.x,
        targetY: targetCoords.y,
        units: selectedUnits,
        tactics: selectedTactic,
      });
      setSelectedUnits({});
    } catch (error) {
      console.error("Send army failed:", error);
    }
  };

  const totalUnits = Object.values(selectedUnits).reduce((a, b) => a + b, 0);

  return (
    <GameLayout>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-3xl font-bold text-amber-500 mb-2">Zarządzanie Armią</h2>
          <p className="text-slate-400">Wyślij wojska do ataku</p>
        </div>

        {/* Marching Armies */}
        {armies && armies.length > 0 && (
          <Card className="bg-slate-900/50 border-amber-700/30 p-4">
            <h3 className="text-lg font-semibold text-amber-500 mb-3 flex items-center gap-2">
              <Clock size={20} />
              Marsze w Toku
            </h3>
            <div className="space-y-2">
              {armies.map((army: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-300">{totalUnits} jednostek</span>
                  <span className="text-amber-400">Przybycie za ~15 minut</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unit Selection */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-900/50 border-amber-700/30 p-4">
              <h3 className="text-lg font-semibold text-amber-500 mb-4 flex items-center gap-2">
                <Users size={20} />
                Wybierz Jednostki
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {UNIT_TYPES.map((unit) => (
                  <div key={unit.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-2xl">{unit.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-100">{unit.name}</p>
                      <p className="text-xs text-slate-400">A:{unit.attack} O:{unit.defense} S:{unit.speed}</p>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      value={selectedUnits[unit.id] || 0}
                      onChange={(e) => handleUnitChange(unit.id, parseInt(e.target.value) || 0)}
                      className="w-16 bg-slate-700 border-amber-700/30 text-amber-400"
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Target Coordinates */}
            <Card className="bg-slate-900/50 border-amber-700/30 p-4">
              <h3 className="text-lg font-semibold text-amber-500 mb-4">Cel Ataku</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Współrzędna X</label>
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={targetCoords.x}
                    onChange={(e) => setTargetCoords((prev) => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                    className="bg-slate-700 border-amber-700/30 text-amber-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Współrzędna Y</label>
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={targetCoords.y}
                    onChange={(e) => setTargetCoords((prev) => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                    className="bg-slate-700 border-amber-700/30 text-amber-400"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Tactics & Summary */}
          <div className="space-y-4">
            {/* Tactics */}
            <Card className="bg-slate-900/50 border-amber-700/30 p-4">
              <h3 className="text-lg font-semibold text-amber-500 mb-3 flex items-center gap-2">
                <Sword size={20} />
                Taktyka
              </h3>
              <div className="space-y-2">
                {TACTICS.map((tactic) => (
                  <button
                    key={tactic.id}
                    onClick={() => setSelectedTactic(tactic.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTactic === tactic.id
                        ? "bg-amber-700/30 border border-amber-500 text-amber-400"
                        : "bg-slate-800/50 border border-amber-700/20 text-slate-300 hover:border-amber-500/50"
                    }`}
                  >
                    <p className="font-semibold">{tactic.name}</p>
                    <p className="text-xs text-slate-400">{tactic.description}</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Summary */}
            <Card className="bg-slate-900/50 border-amber-700/30 p-4">
              <h3 className="text-lg font-semibold text-amber-500 mb-3">Podsumowanie</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Jednostek:</span>
                  <span className="text-amber-400 font-semibold">{totalUnits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Czas Marszu:</span>
                  <span className="text-amber-400 font-semibold">~15 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Moc Ataku:</span>
                  <span className="text-amber-400 font-semibold">+20%</span>
                </div>
              </div>
              <Button
                onClick={handleSendArmy}
                disabled={totalUnits === 0 || sendArmyMutation.isPending}
                className="w-full bg-amber-700 hover:bg-amber-600 text-white"
              >
                Wyślij Armię
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
