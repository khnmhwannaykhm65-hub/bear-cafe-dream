import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import GameLayout from "@/components/layout/GameLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CityBuilder from "./pages/CityBuilder";
import Inventory from "./pages/Inventory";
import Marketplace from "./pages/Marketplace";
import MiniGames from "./pages/MiniGames";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { ReactNode } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-pattern">
      <div className="text-center animate-slide-up space-y-3">
        <div className="text-5xl animate-float">🏙️</div>
        <p className="text-muted-foreground text-sm">กำลังโหลด...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<ProtectedRoute><GameLayout><Dashboard /></GameLayout></ProtectedRoute>} />
            <Route path="/city" element={<ProtectedRoute><GameLayout><CityBuilder /></GameLayout></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><GameLayout><Inventory /></GameLayout></ProtectedRoute>} />
            <Route path="/market" element={<ProtectedRoute><GameLayout><Marketplace /></GameLayout></ProtectedRoute>} />
            <Route path="/minigames" element={<ProtectedRoute><GameLayout><MiniGames /></GameLayout></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><GameLayout><Leaderboard /></GameLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><GameLayout><Profile /></GameLayout></ProtectedRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
