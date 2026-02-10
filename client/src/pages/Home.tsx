import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-6xl font-bold text-amber-500 mb-2">FERRUM</h1>
          <p className="text-2xl text-slate-300">Średniowieczna Strategia MMO</p>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <p className="text-slate-400 text-lg">
            Zbuduj swoją imperię, prowadź armie do bitwy i rządź królestwem w realnym czasie.
          </p>
          <p className="text-slate-500 text-sm">
            Multiplayer • Dynastia • Taktyczne Walki • Wasalizacja
          </p>
        </div>

        <div className="space-y-3">
          {isAuthenticated ? (
            <>
              <Button
                onClick={() => setLocation("/game")}
                className="px-8 py-6 text-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                Wejdź do Gry
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                className="px-8 py-2 text-sm"
              >
                Wyloguj się
              </Button>
            </>
          ) : (
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="px-8 py-6 text-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              Zaloguj się i Graj
            </Button>
          )}
          <p className="text-xs text-slate-500">Gra zapisuje się automatycznie na serwerze</p>
        </div>
      </div>
    </div>
  );
}
