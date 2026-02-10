import React, { useState, useRef, useEffect } from 'react';
import { Village } from '@/contexts/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WorldMapProps {
  villages: Village[];
}

export default function WorldMap({ villages }: WorldMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Generate AI villages
  const aiVillages: Village[] = Array.from({ length: 20 }, (_, i) => ({
    id: `ai_village_${i}`,
    name: `Wioska AI ${i + 1}`,
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
    owner_id: `ai_${i}`,
    resources: { wood: 500, stone: 300, iron: 100, grain: 800, last_update: Date.now() },
    production: { wood: 30, stone: 20, iron: 10, grain: 50 },
    buildings: { town_hall: 1, woodcutter: 1, quarry: 1, iron_mine: 1, farm: 1, warehouse: 1, barracks: 0, stable: 0, workshop: 0, walls: 0, market: 0, academy: 0 },
    build_queue: [],
    population: 30,
    loyalty: 100,
  }));

  const allVillages = [...villages, ...aiVillages];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 50 * zoom;
    for (let x = pan.x % gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = pan.y % gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw villages
    allVillages.forEach((village) => {
      const x = village.x * zoom + pan.x;
      const y = village.y * zoom + pan.y;

      if (x > -30 && x < width + 30 && y > -30 && y < height + 30) {
        // Draw village circle
        ctx.fillStyle = village.owner_id.startsWith('ai') ? '#64748b' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(x, y, 8 * zoom, 0, Math.PI * 2);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = selectedVillage?.id === village.id ? '#fbbf24' : '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label
        ctx.fillStyle = '#e2e8f0';
        ctx.font = `${10 * zoom}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(village.name.substring(0, 8), x, y + 20 * zoom);
      }
    });
  }, [allVillages, zoom, pan, selectedVillage]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - pan.x) / zoom;
    const clickY = (e.clientY - rect.top - pan.y) / zoom;

    for (const village of allVillages) {
      const dx = village.x - clickX;
      const dy = village.y - clickY;
      if (Math.sqrt(dx * dx + dy * dy) < 2) {
        setSelectedVillage(village);
        return;
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Mapa Świata</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              onClick={handleCanvasClick}
              onWheel={handleWheel}
              className="w-full border border-slate-700 rounded cursor-pointer bg-slate-900"
            />
            <p className="text-xs text-slate-400 mt-2">Scroll: zoom | Klik: wybierz wioskę</p>
          </CardContent>
        </Card>
      </div>

      {/* Village Info */}
      <div>
        {selectedVillage ? (
          <Card className="bg-slate-800 border-slate-700 sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">{selectedVillage.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p className="text-slate-400">Pozycja: ({selectedVillage.x}, {selectedVillage.y})</p>
                <p className="text-slate-400">Właściciel: {selectedVillage.owner_id}</p>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-bold text-amber-500">Surowce:</p>
                <p>Drewno: {selectedVillage.resources.wood}</p>
                <p>Kamień: {selectedVillage.resources.stone}</p>
                <p>Żelazo: {selectedVillage.resources.iron}</p>
                <p>Zboże: {selectedVillage.resources.grain}</p>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Zwiad</Button>
                <Button className="w-full bg-red-600 hover:bg-red-700">Atak</Button>
                <Button className="w-full bg-green-600 hover:bg-green-700">Wsparcie</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center text-slate-400">
              Kliknij na wioskę, aby wybrać
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
