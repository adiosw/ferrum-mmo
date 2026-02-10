import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface BattleReport {
  id: string;
  date: number;
  attacker: string;
  defender: string;
  result: 'victory' | 'defeat' | 'draw';
  attacker_losses: Record<string, number>;
  defender_losses: Record<string, number>;
  resources_gained: Record<string, number>;
  morale_change: number;
  tactics_used: string;
}

interface BattleReportsProps {
  reports: BattleReport[];
}

export default function BattleReports({ reports }: BattleReportsProps) {
  const [selectedReport, setSelectedReport] = useState<BattleReport | null>(null);

  // Generate sample reports for demo
  const sampleReports: BattleReport[] = [
    {
      id: 'battle_1',
      date: Date.now() - 3600000,
      attacker: 'Twoja Armia',
      defender: 'Wioska Barbarzyńców',
      result: 'victory',
      attacker_losses: { spearman: 5, archer: 2 },
      defender_losses: { barbarian: 20 },
      resources_gained: { wood: 200, stone: 150, grain: 300 },
      morale_change: 10,
      tactics_used: 'Klin',
    },
  ];

  const allReports = [...reports, ...sampleReports];

  return (
    <div className="space-y-6">
      {/* Reports List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">Raporty Bitew ({allReports.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allReports.length === 0 ? (
            <p className="text-slate-400 text-sm">Brak raportów</p>
          ) : (
            allReports.map((report) => (
              <Dialog key={report.id}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-3 bg-slate-700 border-slate-600 hover:bg-slate-600"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="text-left w-full">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-amber-500">{report.attacker} vs {report.defender}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            report.result === 'victory'
                              ? 'bg-green-900'
                              : report.result === 'defeat'
                              ? 'bg-red-900'
                              : 'bg-yellow-900'
                          }`}
                        >
                          {report.result === 'victory' ? 'ZWYCIĘSTWO' : report.result === 'defeat' ? 'PORAŻKA' : 'REMIS'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{new Date(report.date).toLocaleString()}</p>
                      <p className="text-xs text-slate-500 mt-1">Taktyka: {report.tactics_used}</p>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Raport Bitwy</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Battle Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-bold text-amber-500 mb-2">{report.attacker}</p>
                        <p className="text-sm text-slate-400">Atakujący</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-300 mb-2">{report.defender}</p>
                        <p className="text-sm text-slate-400">Broniący</p>
                      </div>
                    </div>

                    {/* Result */}
                    <div className="text-center">
                      <p
                        className={`text-2xl font-bold ${
                          report.result === 'victory'
                            ? 'text-green-400'
                            : report.result === 'defeat'
                            ? 'text-red-400'
                            : 'text-yellow-400'
                        }`}
                      >
                        {report.result === 'victory' ? '⚔️ ZWYCIĘSTWO' : report.result === 'defeat' ? '💀 PORAŻKA' : '🤝 REMIS'}
                      </p>
                    </div>

                    {/* Losses */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-bold text-sm mb-2">Straty Atakującego:</p>
                        <div className="text-sm text-slate-300 space-y-1">
                          {Object.entries(report.attacker_losses).map(([unit, count]) => (
                            <p key={unit}>
                              {unit}: -{count}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-2">Straty Broniącego:</p>
                        <div className="text-sm text-slate-300 space-y-1">
                          {Object.entries(report.defender_losses).map(([unit, count]) => (
                            <p key={unit}>
                              {unit}: -{count}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Rewards */}
                    <div>
                      <p className="font-bold text-sm mb-2">Łupy:</p>
                      <div className="text-sm text-slate-300 space-y-1">
                        {Object.entries(report.resources_gained).map(([resource, amount]) => (
                          <p key={resource}>
                            {resource}: +{amount}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Tactics */}
                    <div>
                      <p className="font-bold text-sm mb-2">Taktyka Bitwy:</p>
                      <p className="text-sm text-slate-300">{report.tactics_used}</p>
                      <p className="text-xs text-slate-400 mt-1">Morale: {report.morale_change > 0 ? '+' : ''}{report.morale_change}%</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
