import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Home, Map, Sword, Scroll, Crown } from "lucide-react";
import { useLocation } from "wouter";

interface GameLayoutProps {
  children: React.ReactNode;
}

export default function GameLayout({ children }: GameLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: "Miasto", icon: Home, path: "/game/city" },
    { label: "Mapa", icon: Map, path: "/game/map" },
    { label: "Armia", icon: Sword, path: "/game/army" },
    { label: "Raporty", icon: Scroll, path: "/game/reports" },
    { label: "Lord", icon: Crown, path: "/game/lord" },
  ];

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900/30 to-slate-900/30 border-b border-amber-700/30 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-amber-700/20 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold text-amber-500">FERRUM</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user?.name}</span>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-amber-500 hover:bg-amber-700/20"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-gradient-to-b from-slate-900/50 to-slate-950/50 border-r border-amber-700/20 backdrop-blur-sm">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => setLocation(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-amber-700/20 transition-colors text-slate-300 hover:text-amber-400 group"
                  >
                    <Icon size={20} className="group-hover:text-amber-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Resources Display */}
            <div className="p-4 border-t border-amber-700/20 mt-4">
              <h3 className="text-sm font-semibold text-amber-500 mb-3">Zasoby</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Drewno:</span>
                  <span className="text-amber-400 font-semibold">1,250</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kamień:</span>
                  <span className="text-amber-400 font-semibold">890</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Żelazo:</span>
                  <span className="text-amber-400 font-semibold">650</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Zboże:</span>
                  <span className="text-amber-400 font-semibold">2,100</span>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
