import React from 'react';
import { Lord } from '@/contexts/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LordProfileProps {
  lord: Lord;
}

const TRAIT_DESCRIPTIONS: Record<string, string> = {
  commander: '+10% Atak Jednostek',
  engineer: '+15% Szybkość Budowy',
  tax_collector: '+15% Podatek',
  tactician: '+10% Bonus Taktyk',
  architect: '+20% Obrona Murów',
  merchant: '+15% Efektywność Handlu',
  farmer: '+20% Produkcja Zboża',
  miner: '+15% Produkcja Kamienia i Żelaza',
  forester: '+15% Produkcja Drewna',
  builder: '-10% Koszt Budowy',
  defender: '+10% Obrona Jednostek',
  trainer: '+15% Szybkość Rekrutacji',
  siege_master: '+20% Efektywność Oblężeń',
  scout_master: '+25% Szybkość Zwiadów',
  diplomat: '+5% Danina od Wasali',
  charismatic: '+10% Wzrost Lojalności',
  negotiator: '-15% Koszt Okupu',
  inventor: '+10% Szybkość Badań',
  healer: '+15% Odzyskiwanie Jednostek',
  scholar: '+20% Zdobywanie Doświadczenia',
};

const FLAW_DESCRIPTIONS: Record<string, string> = {
  sickly: '-20% Czas Życia',
  greedy: '-10% Morale Wojsk',
  spendthrift: '-10% Dochód Zasobów',
  lazy: '-15% Szybkość Produkcji',
  corrupt: '-15% Podatek',
  cowardly: '-20% Morale Wojsk',
  rash: '+10% Straty Wojsk',
  slow: '-10% Szybkość Jednostek',
  tyrant: '-15% Kara Lojalności',
  weak_willed: '+10% Szansa Buntu Wasali',
  unlucky: '-20% Szczęście w Eventach',
};

export default function LordProfile({ lord }: LordProfileProps) {
  const lifespan = lord.death_date - lord.birth_date;
  const elapsed = Date.now() - lord.birth_date;
  const lifeProgress = Math.min(100, (elapsed / lifespan) * 100);

  return (
    <div className="space-y-6">
      {/* Lord Card */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-amber-500">{lord.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <p className="text-slate-400">DNA: {lord.dna_id}</p>
            <p className="text-slate-400">Urodzenie: {new Date(lord.birth_date).toLocaleDateString()}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-2">Czas Życia</p>
            <Progress value={lifeProgress} className="h-2" />
            <p className="text-xs text-slate-500 mt-1">
              {Math.max(0, Math.ceil((lord.death_date - Date.now()) / (24 * 60 * 60 * 1000)))} dni pozostało
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Traits */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">Cechy Charakteru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {lord.traits.length === 0 ? (
            <p className="text-slate-400 text-sm">Brak cech</p>
          ) : (
            lord.traits.map((trait) => (
              <div key={trait} className="bg-slate-700 p-3 rounded">
                <p className="font-bold text-green-400">{trait.toUpperCase()}</p>
                <p className="text-sm text-slate-300">{TRAIT_DESCRIPTIONS[trait] || 'Nieznana cecha'}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Flaws */}
      {lord.flaws.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Wady</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lord.flaws.map((flaw) => (
              <div key={flaw} className="bg-red-900 bg-opacity-30 p-3 rounded border border-red-700">
                <p className="font-bold text-red-400">{flaw.toUpperCase()}</p>
                <p className="text-sm text-slate-300">{FLAW_DESCRIPTIONS[flaw] || 'Nieznana wada'}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dynasty Info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">Historia Dynastii</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-amber-500 font-bold">{lord.name} (Obecny)</p>
            <p className="text-slate-400">Cechy: {lord.traits.join(', ')}</p>
            <p className="text-slate-400">Wady: {lord.flaws.length > 0 ? lord.flaws.join(', ') : 'Brak'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
