import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import GameLayout from "@/components/GameLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface Village {
  id: string;
  x: number;
  y: number;
  playerId: number | null;
  name: string;
  type: "player" | "barbarian" | "treasure" | "ruins";
  owner: string | null;
  population: number;
  wallLevel: number;
}

interface SelectedVillage {
  village: Village;
  x: number;
  y: number;
}

const GRID_SIZE = 100;
const CELL_SIZE = 40;

export default function WorldMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [selectedVillage, setSelectedVillage] = useState<SelectedVillage | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);

  // Fetch world map
  const { data: worldMap } = trpc.game.getWorldMap.useQuery();

  useEffect(() => {
    if (worldMap?.villages) {
      setVillages(worldMap.villages);
    }
  }, [worldMap]);

  // Draw map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      const x = i * CELL_SIZE * zoom + panX;
      const y = i * CELL_SIZE * zoom + panY;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw villages
    villages.forEach((village) => {
      const x = village.x * CELL_SIZE * zoom + panX;
      const y = village.y * CELL_SIZE * zoom + panY;

      if (x < -50 || x > width + 50 || y < -50 || y > height + 50) return;

      // Draw village circle
      const radius = 8 * zoom;
      ctx.fillStyle = village.type === "barbarian" ? "#92400e" : "#f59e0b";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = village.type === "barbarian" ? "#b45309" : "#fbbf24";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw wall level
      if (zoom > 0.5) {
        ctx.fillStyle = "#fff";
        ctx.font = `${10 * zoom}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(village.wallLevel.toString(), x, y);
      }
    });
  }, [zoom, panX, panY, villages]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - panX) / (CELL_SIZE * zoom);
    const clickY = (e.clientY - rect.top - panY) / (CELL_SIZE * zoom);

    const clicked = villages.find((v) => {
      const dist = Math.sqrt(
        Math.pow(v.x - clickX, 2) + Math.pow(v.y - clickY, 2)
      );
      return dist < 1;
    });

    if (clicked) {
      setSelectedVillage({
        village: clicked,
        x: clicked.x,
        y: clicked.y,
      });
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    let startX = e.clientX;
    let startY = e.clientY;
    let startPanX = panX;
    let startPanY = panY;

    const handleMouseMove = (moveE: MouseEvent) => {
      const deltaX = moveE.clientX - startX;
      const deltaY = moveE.clientY - startY;
      setPanX(startPanX + deltaX);
      setPanY(startPanY + deltaY);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <GameLayout>
      <div className="space-y-4">
        {/* Title */}
        <div>
          <h2 className="text-3xl font-bold text-amber-500 mb-2">Mapa Świata</h2>
          <p className="text-slate-400">Odkrywaj świat i atakuj wioski</p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={() => setZoom((prev) => Math.min(3, prev * 1.2))}
            variant="outline"
            size="sm"
            className="border-amber-700/30 hover:bg-amber-700/20"
          >
            <ZoomIn size={18} />
          </Button>
          <Button
            onClick={() => setZoom((prev) => Math.max(0.5, prev / 1.2))}
            variant="outline"
            size="sm"
            className="border-amber-700/30 hover:bg-amber-700/20"
          >
            <ZoomOut size={18} />
          </Button>
          <span className="text-sm text-slate-400 flex items-center">
            Zoom: {(zoom * 100).toFixed(0)}%
          </span>
        </div>

        {/* Canvas */}
        <div className="relative bg-slate-950 rounded-lg border border-amber-700/30 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleCanvasClick}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            className="w-full cursor-grab active:cursor-grabbing"
          />
        </div>

        {/* Village Info */}
        {selectedVillage && (
          <Card className="bg-slate-900/50 border-amber-700/30 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Nazwa:</p>
                <p className="text-amber-400 font-semibold">
                  {selectedVillage.village.owner || "Barbarzyńcy"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Pozycja:</p>
                <p className="text-amber-400 font-semibold">
                  ({selectedVillage.x}, {selectedVillage.y})
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Mur:</p>
                <p className="text-amber-400 font-semibold">{selectedVillage.village.wallLevel}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Typ:</p>
                <p className="text-amber-400 font-semibold">
                  {selectedVillage.village.type === "barbarian" ? "Barbarzyńcy" : "Gracz"}
                </p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-amber-700 hover:bg-amber-600">
              Wyślij Armię
            </Button>
          </Card>
        )}
      </div>
    </GameLayout>
  );
}
