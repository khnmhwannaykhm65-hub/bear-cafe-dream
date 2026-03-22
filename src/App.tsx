import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import GameLayout from "@/components/layout/GameLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CityBuilder from "./pages/CityBuilder";
import Inventory from "./pages/Inventory";
import Marketplace from "./pages/Marketplace";
import MiniGames from "./pages/MiniGames";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<GameLayout><Dashboard /></GameLayout>} />
          <Route path="/city" element={<GameLayout><CityBuilder /></GameLayout>} />
          <Route path="/inventory" element={<GameLayout><Inventory /></GameLayout>} />
          <Route path="/market" element={<GameLayout><Marketplace /></GameLayout>} />
          <Route path="/minigames" element={<GameLayout><MiniGames /></GameLayout>} />
          <Route path="/leaderboard" element={<GameLayout><Leaderboard /></GameLayout>} />
          <Route path="/profile" element={<GameLayout><Profile /></GameLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
