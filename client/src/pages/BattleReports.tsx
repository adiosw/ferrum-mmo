import { trpc } from "@/lib/trpc";
import GameLayout from "@/components/GameLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scroll, Trophy, Skull } from "lucide-react";

export default function BattleReports() {
  const { data: reports, isLoading } = trpc.game.getBattleReports.useQuery();

  const mockReports = [
    {
      id: "1",
      attacker: "Twoja Wioska",
      defender: "Barbarzyńcy",
      result: "victory",
      date: new Date(Date.now() - 3600000),
      attackerLosses: 15,
      defenderLosses: 45,
      resourcesGained: { wood: 250, stone: 180, iron: 120, grain: 300 },
      morale: "+5%",
    },
    {
      id: "2",
      attacker: "Gracz Wróg",
      defender: "Twoja Wioska",
      result: "defeat",
      date: new Date(Date.now() - 7200000),
      attackerLosses: 30,
      defenderLosses: 50,
      resourcesGained: { wood: 0, stone: 0, iron: 0, grain: 0 },
      morale: "-10%",
    },
    {
      id: "3",
      attacker: "Twoja Wioska",
      defender: "Wioska Sojusznika",
      result: "draw",
      date: new Date(Date.now() - 10800000),
      attackerLosses: 25,
      defenderLosses: 25,
      resourcesGained: { wood: 100, stone: 80, iron: 60, grain: 150 },
      morale: "0%",
    },
  ];

  return (
    <GameLayout>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-3xl font-bold text-amber-500 mb-2">Raporty Bitew</h2>
          <p className="text-slate-400">Historia twoich walk</p>
        </div>

        {/* Battle Reports List */}
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-slate-400">Ładowanie raportów...</p>
          ) : (mockReports || []).length === 0 ? (
            <Card className="bg-slate-900/50 border-amber-700/30 p-6 text-center">
              <p className="text-slate-400">Brak raportów bitew</p>
            </Card>
          ) : (
            (mockReports || []).map((report: any) => (
              <Card
                key={report.id}
                className="bg-slate-900/50 border-amber-700/30 p-4 hover:bg-slate-900/70 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-slate-100">{report.attacker}</span>
                      <span className="text-slate-400">vs</span>
                      <span className="text-lg font-semibold text-slate-100">{report.defender}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {report.date.toLocaleString("pl-PL")}
                    </p>
                  </div>
                  <Badge
                    className={`${
                      report.result === "victory"
                        ? "bg-green-900/50 text-green-400 border-green-700/50"
                        : report.result === "defeat"
                        ? "bg-red-900/50 text-red-400 border-red-700/50"
                        : "bg-slate-700/50 text-slate-300 border-slate-600/50"
                    }`}
                  >
                    {report.result === "victory" && <Trophy size={14} className="mr-1" />}
                    {report.result === "defeat" && <Skull size={14} className="mr-1" />}
                    {report.result === "victory"
                      ? "Zwycięstwo"
                      : report.result === "defeat"
                      ? "Porażka"
                      : "Remis"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-slate-400">Straty Atakującego:</p>
                    <p className="text-amber-400 font-semibold">{report.attackerLosses}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Straty Broniącego:</p>
                    <p className="text-amber-400 font-semibold">{report.defenderLosses}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Morale:</p>
                    <p className={`font-semibold ${
                      report.morale.includes("+") ? "text-green-400" : report.morale.includes("-") ? "text-red-400" : "text-slate-400"
                    }`}>
                      {report.morale}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Łupy:</p>
                    <p className="text-amber-400 font-semibold">
                      {report.resourcesGained.wood + report.resourcesGained.stone}
                    </p>
                  </div>
                </div>

                {/* Resources Gained */}
                {(report.resourcesGained.wood > 0 ||
                  report.resourcesGained.stone > 0 ||
                  report.resourcesGained.iron > 0 ||
                  report.resourcesGained.grain > 0) && (
                  <div className="bg-slate-800/50 rounded p-3 text-sm">
                    <p className="text-amber-500 font-semibold mb-2 flex items-center gap-2">
                      <Scroll size={14} />
                      Zdobyte Zasoby:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <p className="text-slate-400">Drewno:</p>
                        <p className="text-amber-400">{report.resourcesGained.wood}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Kamień:</p>
                        <p className="text-amber-400">{report.resourcesGained.stone}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Żelazo:</p>
                        <p className="text-amber-400">{report.resourcesGained.iron}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Zboże:</p>
                        <p className="text-amber-400">{report.resourcesGained.grain}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </GameLayout>
  );
}
