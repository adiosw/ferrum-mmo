import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle } from "lucide-react";

interface StarterProtectionProps {
  protectionUntil?: Date;
  onRemove?: () => void;
}

export default function StarterProtection({
  protectionUntil,
  onRemove,
}: StarterProtectionProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isProtected, setIsProtected] = useState(false);

  useEffect(() => {
    if (!protectionUntil) return;

    const updateTimer = () => {
      const now = new Date();
      const until = new Date(protectionUntil);
      const diff = until.getTime() - now.getTime();

      if (diff <= 0) {
        setIsProtected(false);
        setTimeRemaining("");
        return;
      }

      setIsProtected(true);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [protectionUntil]);

  if (!isProtected) return null;

  return (
    <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700/50 p-4 mb-4">
      <div className="flex items-start gap-3">
        <Shield className="text-green-400 mt-1 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-green-400 mb-1">Ochrona Startowa Aktywna</h3>
          <p className="text-sm text-slate-300 mb-3">
            Jesteś chroniony przed atakami przez {timeRemaining}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={onRemove}
              size="sm"
              variant="outline"
              className="border-green-700 text-green-400 hover:bg-green-900/30"
            >
              Usuń Ochronę
            </Button>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <AlertCircle size={14} />
              Usunięcie ochrony jest nieodwracalne
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
