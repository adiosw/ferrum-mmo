import { useState } from "react";
import { trpc } from "@/lib/trpc";
import GameLayout from "@/components/GameLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Crown, Zap, Shield, Clock } from "lucide-react";

const CROWN_PACKAGES = [
  { id: "small", crowns: 20, price: 9, bonus: "0%" },
  { id: "medium", crowns: 50, price: 19, bonus: "+5%" },
  { id: "large", crowns: 120, price: 39, bonus: "+15%" },
  { id: "xlarge", crowns: 300, price: 79, bonus: "+25%" },
];

const BOOSTERS = [
  {
    id: "instant_build",
    name: "Natychmiastowa Budowa",
    description: "Natychmiast ukończ budynek",
    cost: 50,
    icon: "🏗️",
  },
  {
    id: "instant_recruit",
    name: "Natychmiastowa Rekrutacja",
    description: "Natychmiast zrekrutuj jednostki",
    cost: 40,
    icon: "⚔️",
  },
  {
    id: "instant_return",
    name: "Natychmiastowy Powrót",
    description: "Natychmiast wróć z marszu",
    cost: 30,
    icon: "🚀",
  },
  {
    id: "extra_protection",
    name: "+12h Ochrony",
    description: "Dodaj 12 godzin ochrony startowej",
    cost: 25,
    icon: "🛡️",
  },
];

export default function Shop() {
  const [selectedPackage, setSelectedPackage] = useState<string>("medium");
  const [loading, setLoading] = useState(false);

  const { data: currency } = trpc.payments.getCurrencyBalance.useQuery();
  const { data: premium } = trpc.payments.getPremiumStatus.useQuery();
  const createCheckoutMutation = trpc.payments.createCheckoutSession.useMutation();
  const spendCrownsMutation = trpc.payments.spendCrowns.useMutation();

  const handleBuyCrowns = async () => {
    setLoading(true);
    try {
      const result = await createCheckoutMutation.mutateAsync({
        type: "crowns",
        packageId: selectedPackage,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Failed to create checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPremium = async () => {
    setLoading(true);
    try {
      const result = await createCheckoutMutation.mutateAsync({
        type: "premium",
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Failed to create checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyBooster = async (boosterId: string) => {
    const booster = BOOSTERS.find((b) => b.id === boosterId);
    if (!booster || !currency) return;

    if (currency.crowns < booster.cost) {
      alert("Niewystarczająco koron!");
      return;
    }

    try {
      await spendCrownsMutation.mutateAsync({
        amount: booster.cost,
        reason: `Booster: ${booster.name}`,
      });
      alert(`Zakupiono: ${booster.name}`);
    } catch (error) {
      console.error("Failed to buy booster:", error);
    }
  };

  return (
    <GameLayout>
      <div className="space-y-8">
        {/* Header with Currency */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-amber-500 mb-2">Sklep FERRUM</h2>
            <p className="text-slate-400">Wzmocnij swoją grę</p>
          </div>
          <Card className="bg-amber-900/30 border-amber-700/50 p-4">
            <div className="flex items-center gap-2">
              <Crown size={24} className="text-amber-400" />
              <div>
                <p className="text-slate-400 text-sm">Korony</p>
                <p className="text-2xl font-bold text-amber-400">{currency?.crowns || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Premium Section */}
        <div>
          <h3 className="text-xl font-semibold text-amber-500 mb-4 flex items-center gap-2">
            <Zap size={20} />
            Konto Premium (30 dni)
          </h3>
          <Card className="bg-gradient-to-r from-amber-900/30 to-purple-900/30 border-amber-700/50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-2xl font-bold text-amber-400 mb-4">25 zł</h4>
                <ul className="space-y-2 text-sm text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    +20% szybkości budowy
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    +20% szybkości rekrutacji
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    +1 slot kolejki budowy
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Rozszerzone raporty
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Oznaczanie mapy
                  </li>
                </ul>
                  <Button
                    onClick={handleBuyPremium}
                    disabled={loading || (premium?.isPremium ?? false)}
                    className="w-full bg-purple-700 hover:bg-purple-600"
                  >
                    {premium?.isPremium ? "Już posiadasz Premium" : "Kup Premium"}
                  </Button>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-2">Brak bonusów bojowych</p>
                <p className="text-slate-400 text-sm">Premium jest czysto wspierającą opcją, nie dającą przewagi w walce.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Crowns Section */}
        <div>
          <h3 className="text-xl font-semibold text-amber-500 mb-4 flex items-center gap-2">
            <Coins size={20} />
            Kup Korony
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CROWN_PACKAGES.map((pkg) => (
              <Card
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`p-4 cursor-pointer transition-all ${
                  selectedPackage === pkg.id
                    ? "border-amber-500 bg-amber-900/30"
                    : "border-amber-700/30 bg-slate-900/50 hover:border-amber-500/50"
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400 mb-2">{pkg.crowns}</div>
                  <p className="text-slate-300 font-semibold mb-2">Koron</p>
                  {pkg.bonus !== "0%" && (
                    <Badge className="bg-green-900/50 text-green-400 mb-3">
                      Bonus {pkg.bonus}
                    </Badge>
                  )}
                  <p className="text-xl font-bold text-amber-500">{pkg.price} zł</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(pkg.price / pkg.crowns).toFixed(2)} zł/korona
                  </p>
                </div>
              </Card>
            ))}
          </div>
          <Button
            onClick={handleBuyCrowns}
            disabled={loading}
            className="w-full mt-4 bg-amber-700 hover:bg-amber-600 text-white py-6 text-lg"
          >
            Przejdź do Płatności
          </Button>
        </div>

        {/* Boosters Section */}
        <div>
          <h3 className="text-xl font-semibold text-amber-500 mb-4 flex items-center gap-2">
            <Zap size={20} />
            Boostery (Płatne Koronami)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BOOSTERS.map((booster) => (
              <Card key={booster.id} className="bg-slate-900/50 border-amber-700/30 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{booster.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-100">{booster.name}</h4>
                    <p className="text-xs text-slate-400">{booster.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Crown size={16} className="text-amber-400" />
                    <span className="font-bold text-amber-400">{booster.cost}</span>
                  </div>
                  <Button
                    onClick={() => handleBuyBooster(booster.id)}
                    size="sm"
                    disabled={!currency || (currency?.crowns || 0) < booster.cost}
                    className="bg-amber-700 hover:bg-amber-600"
                  >
                    Kup
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <Card className="bg-slate-900/50 border-amber-700/30 p-4">
          <h4 className="font-semibold text-amber-500 mb-2">ℹ️ Informacje</h4>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Wszystkie ceny w PLN (Złotych Polskich)</li>
            <li>• Płatności obsługiwane przez Stripe (karta, BLIK, Google Pay)</li>
            <li>• Korony nigdy nie wygasają</li>
            <li>• Brak refundów za boostery</li>
            <li>• Premium można anulować w każdej chwili</li>
          </ul>
        </Card>
      </div>
    </GameLayout>
  );
}
