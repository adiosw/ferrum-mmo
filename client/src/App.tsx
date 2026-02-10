import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CityView from "./pages/CityView";
import WorldMap from "./pages/WorldMap";
import ArmyManagement from "./pages/ArmyManagement";
import BattleReports from "./pages/BattleReports";
import LordProfile from "./pages/LordProfile";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/game/city"} component={CityView} />
      <Route path={"/game/map"} component={WorldMap} />
      <Route path={"/game/army"} component={ArmyManagement} />
      <Route path={"/game/reports"} component={BattleReports} />
      <Route path={"/game/lord"} component={LordProfile} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
