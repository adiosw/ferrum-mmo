import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TutorialProps {
  step: number;
  onComplete: () => void;
}

export default function Tutorial({ step, onComplete }: TutorialProps) {
  const steps = [
    {
      title: 'Witaj w FERRUM!',
      description: 'Jesteś nowym władcą. Twoim zadaniem jest budowanie imperium, rekrutowanie armii i podbijanie terytoriów.',
      action: 'Kliknij "Dalej", aby kontynuować',
    },
    {
      title: 'Surowce',
      description: 'Twoje imperium potrzebuje surowców: Drewna, Kamienia, Żelaza i Zboża. Buduj budynki produkcyjne, aby je zbierać.',
      action: 'Przejdź do Miasta i uaktualnij Chatkę Drwala do poziomu 2',
    },
    {
      title: 'Werbunek Wojska',
      description: 'Bez armii nie możesz się bronić ani atakować. Przejdź do Armii i werbuj 5 Włóczników.',
      action: 'Werbuj jednostki w Koszarach',
    },
    {
      title: 'Zwiad',
      description: 'Przed atakiem zawsze wyślij zwiad! Pozwoli ci zobaczyć siłę wroga i zaplanować strategię.',
      action: 'Przejdź do Mapy i wyślij zwiad na pobliską wioskę barbarzyńców',
    },
    {
      title: 'Pierwsza Bitwa',
      description: 'Czas na pierwszą bitwę! Zaatakuj wioskę barbarzyńców swoją armią. Pamiętaj o taktyce!',
      action: 'Zaatakuj wioskę barbarzyńców',
    },
    {
      title: 'Ekspansja',
      description: 'Gratulacje! Zdobyłeś swoją pierwszą wioskę. Teraz możesz ją kolonizować i rozbudowywać imperium.',
      action: 'Kontynuuj grę i zbuduj drugie imperium',
    },
  ];

  const currentStep = steps[step] || steps[0];

  if (step >= steps.length) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-slate-800 border-amber-600 w-96 shadow-2xl">
        <CardHeader className="bg-amber-600 bg-opacity-20">
          <CardTitle className="text-amber-500">{currentStep.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-slate-300">{currentStep.description}</p>
          <p className="text-sm text-slate-400 italic">{currentStep.action}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onComplete}
              className="flex-1"
            >
              Pomiń Tutorial
            </Button>
            <Button
              onClick={onComplete}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {step === steps.length - 1 ? 'Zakończ' : 'Dalej'}
            </Button>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Krok {step + 1} z {steps.length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
