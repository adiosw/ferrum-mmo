import React, { useState } from 'react';
import { Army, Village } from '@/contexts/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ArmyManagementProps {
  armies: Army[];
  villages: Village[];
}

const UNITS = {
  spearman: { name: 'Włócznik', icon: '🗡️', cost: { wood: 50, grain: 30 } },
  swordsman: { name: 'Mieczysta', icon: '⚔️', cost: { wood: 80, iron: 20, grain: 40 } },
  archer: { name: 'Łucznik', icon: '🏹', cost: { wood: 60, iron: 10, grain: 30 } },
  cavalry: { name: 'Kawaleria', icon: '🐴', cost: { wood: 100, iron: 40, grain: 60 } },
  ram: { name: 'Taran', icon: '🪵', cost: { wood: 200, stone: 100, iron: 50 } },
  catapult: { name: 'Katapulta', icon: '🎯', cost: { wood: 150, stone: 150, iron: 100 } },
  herald: { name: 'Herold', icon: '📯', cost: { wood: 50, iron: 30, grain: 50 } },
};

export default function ArmyManagement({ armies, villages }: ArmyManagementProps) {
  const [selectedArmy, setSelectedArmy] = useState<Army | null>(null);

  return (
    <div className="space-y-6">
      {/* Active Armies */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">Aktywne Armie ({armies.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {armies.length === 0 ? (
            <p className="text-slate-400 text-sm">Brak aktywnych armii</p>
          ) : (
            armies.map((army) => (
              <div
                key={army.id}
                className="bg-slate-700 p-4 rounded cursor-pointer hover:bg-slate-600"
                onClick={() => setSelectedArmy(army)}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-amber-500">Armia {army.id.substring(0, 8)}</p>
                  <span className={`text-xs px-2 py-1 rounded ${army.status === 'marching' ? 'bg-blue-900' : 'bg-green-900'}`}>
                    {army.status === 'marching' ? 'Marsz' : 'Gotowa'}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-2">
                  Pozycja: ({army.location.x}, {army.location.y})
                </p>
                {army.target && (
                  <p className="text-sm text-slate-400">
                    Cel: ({army.target.x}, {army.target.y})
                    {army.arrival_time && (
                      <span> - ETA: {Math.max(0, Math.ceil((army.arrival_time - Date.now()) / 1000))}s</span>
                    )}
                  </p>
                )}
                <div className="mt-2 text-xs text-slate-400">
                  {Object.entries(army.units).map(([unit, count]) => (
                    <span key={unit} className="mr-3">
                      {count}x {UNITS[unit as keyof typeof UNITS]?.name || unit}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recruit Units */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">Werbunek Jednostek</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(UNITS).map(([key, unit]) => (
              <Dialog key={key}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 bg-slate-700 border-slate-600 hover:bg-slate-600"
                  >
                    <span className="text-2xl">{unit.icon}</span>
                    <span className="text-xs">{unit.name}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle>{unit.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <p className="font-bold mb-2">Koszt Rekrutacji:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(unit.cost).map(([resource, amount]) => (
                          <div key={resource}>
                            {resource.charAt(0).toUpperCase() + resource.slice(1)}: {amount}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="font-bold mb-2">Ilość:</p>
                      <input type="number" min="1" max="100" defaultValue="10" className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded" />
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700">Werbuj</Button>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Army Details */}
      {selectedArmy && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Szczegóły Armii</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <p className="text-slate-400">ID: {selectedArmy.id}</p>
              <p className="text-slate-400">Status: {selectedArmy.status}</p>
              <p className="text-slate-400">
                Pozycja: ({selectedArmy.location.x}, {selectedArmy.location.y})
              </p>
            </div>
            <div className="space-y-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Przesuń</Button>
              <Button className="w-full bg-red-600 hover:bg-red-700">Zaatakuj</Button>
              <Button className="w-full bg-slate-600 hover:bg-slate-500">Rozwiąż</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
