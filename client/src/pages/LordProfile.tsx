import { trpc } from "@/lib/trpc";
import GameLayout from "@/components/GameLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, AlertCircle, Heart } from "lucide-react";

const TRAITS = {
  commander: { name: "Dowódca", bonus: "+10% Atak", icon: "⚔️", color: "text-green-400" },
  engineer: { name: "Inżynier", bonus: "+15% Szybkość Budowy", icon: "🔧", color: "text-blue-400" },
  collector: { name: "Poborca", bonus: "+15% Podatek", icon: "💰", color: "text-yellow-400" },
  diplomat: { name: "Dyplomata", bonus: "+20% Morale Sojuszników", icon: "🤝", color: "text-purple-400" },
  strategist: { name: "Strateg", bonus: "+10% Obrona", icon: "🎯", color: "text-cyan-400" },
  merchant: { name: "Kupiec", bonus: "+25% Handel", icon: "🏪", color: "text-orange-400" },
};

const FLAWS = {
  sickly: { name: "Chorowity", penalty: "-20% Lifespan", icon: "🤒", color: "text-red-400" },
  greedy: { name: "Chciwy", penalty: "-10% Morale", icon: "💸", color: "text-orange-400" },
  coward: { name: "Tchórz", penalty: "-15% Atak", icon: "😨", color: "text-purple-400" },
  lazy: { name: "Leniwy", penalty: "-10% Produkcja", icon: "😴", color: "text-slate-400" },
  arrogant: { name: "Arogancki", penalty: "-5% Sojusze", icon: "😤", color: "text-pink-400" },
};

export default function LordProfile() {
  const { data: gameState } = trpc.game.getGameState.useQuery();

  const mockLord = {
    id: "lord_1",
    name: "Władca Żelaza",
    dnaId: "DNA_12345",
    level: 15,
    experience: 4500,
    age: 42,
    lifespan: 60,
    traits: ["commander", "engineer"],
    flaws: ["greedy"],
    victories: 23,
    defeats: 3,
    vassals: 5,
  };

  const displayLord = mockLord;

  return (
    <GameLayout>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-3xl font-bold text-amber-500 mb-2 flex items-center gap-2">
            <Crown size={32} />
            Profil Lorda
          </h2>
          <p className="text-slate-400">Twój władca i jego cechy</p>
        </div>

        {/* Lord Header */}
        <Card className="bg-gradient-to-r from-amber-900/30 to-slate-900/30 border-amber-700/50 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-amber-400 mb-1">{displayLord.name}</h3>
              <p className="text-slate-400 text-sm">DNA: {displayLord.dnaId}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-amber-500">Lvl {displayLord.level}</p>
              <p className="text-slate-400 text-sm">{displayLord.experience} EXP</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Wiek:</p>
              <p className="text-amber-400 font-semibold">{displayLord.age} lat</p>
            </div>
            <div>
              <p className="text-slate-400">Zwycięstwa:</p>
              <p className="text-green-400 font-semibold">{displayLord.victories}</p>
            </div>
            <div>
              <p className="text-slate-400">Porażki:</p>
              <p className="text-red-400 font-semibold">{displayLord.defeats}</p>
            </div>
            <div>
              <p className="text-slate-400">Wasale:</p>
              <p className="text-amber-400 font-semibold">{displayLord.vassals}</p>
            </div>
          </div>

          {/* Lifespan Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Żywotność:</span>
              <span className="text-amber-400">{displayLord.age}/{displayLord.lifespan} lat</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-red-500 h-full transition-all"
                style={{ width: `${(displayLord.age / displayLord.lifespan) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traits */}
          <Card className="bg-slate-900/50 border-amber-700/30 p-4">
            <h3 className="text-lg font-semibold text-amber-500 mb-4 flex items-center gap-2">
              <Zap size={20} />
              Cechy Pozytywne
            </h3>
            <div className="space-y-3">
              {displayLord.traits.map((traitId: string) => {
                const trait = TRAITS[traitId as keyof typeof TRAITS];
                if (!trait) return null;
                return (
                  <div
                    key={traitId}
                    className="p-3 bg-slate-800/50 rounded-lg border border-green-700/30 hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{trait.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-100">{trait.name}</p>
                        <p className={`text-sm ${trait.color}`}>{trait.bonus}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {displayLord.traits.length === 0 && (
                <p className="text-slate-400 text-sm">Brak cech pozytywnych</p>
              )}
            </div>
          </Card>

          {/* Flaws */}
          <Card className="bg-slate-900/50 border-amber-700/30 p-4">
            <h3 className="text-lg font-semibold text-amber-500 mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Cechy Negatywne
            </h3>
            <div className="space-y-3">
              {displayLord.flaws.map((flawId: string) => {
                const flaw = FLAWS[flawId as keyof typeof FLAWS];
                if (!flaw) return null;
                return (
                  <div
                    key={flawId}
                    className="p-3 bg-slate-800/50 rounded-lg border border-red-700/30 hover:border-red-500/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{flaw.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-100">{flaw.name}</p>
                        <p className={`text-sm ${flaw.color}`}>{flaw.penalty}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {displayLord.flaws.length === 0 && (
                <p className="text-slate-400 text-sm">Brak cech negatywnych</p>
              )}
            </div>
          </Card>
        </div>

        {/* Dynasty Info */}
        <Card className="bg-slate-900/50 border-amber-700/30 p-4">
          <h3 className="text-lg font-semibold text-amber-500 mb-4 flex items-center gap-2">
            <Heart size={20} />
            Informacje o Dynastii
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Pokolenie:</p>
              <p className="text-amber-400 font-semibold">3</p>
            </div>
            <div>
              <p className="text-slate-400">Poprzedni Lord:</p>
              <p className="text-amber-400 font-semibold">Władca Drewna</p>
            </div>
            <div>
              <p className="text-slate-400">Następca:</p>
              <p className="text-amber-400 font-semibold">Nieznany</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-4">
            Twój lord żyje już {displayLord.age} lat. Za {displayLord.lifespan - displayLord.age} lat będzie musiał wybrać następcę.
          </p>
        </Card>
      </div>
    </GameLayout>
  );
}
