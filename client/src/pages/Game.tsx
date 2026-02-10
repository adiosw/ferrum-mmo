import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import CityView from '@/components/CityView';
import WorldMap from '@/components/WorldMap';
import ArmyManagement from '@/components/ArmyManagement';
import LordProfile from '@/components/LordProfile';
import BattleReports from '@/components/BattleReports';
import Tutorial from '@/components/Tutorial';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type GameTab = 'city' | 'map' | 'army' | 'lord' | 'reports';

export default function Game() {
  const { gameState, processGameTick, saveGame } = useGame();
  const [activeTab, setActiveTab] = useState<GameTab>('city');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  // Game tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      processGameTick();
    }, 1000);
    return () => clearInterval(interval);
  }, [processGameTick]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveGame();
    }, 30000);
    return () => clearInterval(interval);
  }, [saveGame]);

  if (!gameState) {
    return <div className="flex items-center justify-center h-screen">Ładowanie gry...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="container flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-amber-500">FERRUM</h1>
            <p className="text-sm text-slate-400">Gracz: {gameState.player_id.substring(0, 8)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm">Główna Wioska</p>
            <p className="text-xs text-slate-400">Drewno: {gameState.villages[0].resources.wood} | Kamień: {gameState.villages[0].resources.stone}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 relative">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as GameTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="city">Miasto</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="army">Armia</TabsTrigger>
            <TabsTrigger value="lord">Lord</TabsTrigger>
            <TabsTrigger value="reports">Raporty</TabsTrigger>
          </TabsList>

          <TabsContent value="city">
            <CityView village={gameState.villages[0]} />
          </TabsContent>

          <TabsContent value="map">
            <WorldMap villages={gameState.villages} />
          </TabsContent>

          <TabsContent value="army">
            <ArmyManagement armies={gameState.armies} villages={gameState.villages} />
          </TabsContent>

          <TabsContent value="lord">
            <LordProfile lord={gameState.lord} />
          </TabsContent>

          <TabsContent value="reports">
            <BattleReports reports={gameState.reports} />
          </TabsContent>
        </Tabs>
      </main>
      {showTutorial && (
        <Tutorial
          step={tutorialStep}
          onComplete={() => {
            if (tutorialStep >= 5) {
              setShowTutorial(false);
            } else {
              setTutorialStep(tutorialStep + 1);
            }
          }}
        />
      )}
    </div>
  );
}
