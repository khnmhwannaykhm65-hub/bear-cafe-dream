import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Building2, Backpack, Store, Gamepad2, Trophy, User, Menu, X, Coins, Star, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/game-logic';
import { useToast } from '@/hooks/use-toast';

const NAV_ITEMS = [
  { path: '/dashboard', icon: Home, label: 'หน้าหลัก', emoji: '🏠' },
  { path: '/city', icon: Building2, label: 'เมืองของฉัน', emoji: '🏙️' },
  { path: '/inventory', icon: Backpack, label: 'กระเป๋าไอเทม', emoji: '🎒' },
  { path: '/market', icon: Store, label: 'ตลาด', emoji: '🏪' },
  { path: '/minigames', icon: Gamepad2, label: 'มินิเกม', emoji: '🎰' },
  { path: '/leaderboard', icon: Trophy, label: 'อันดับ', emoji: '🏆' },
  { path: '/profile', icon: User, label: 'โปรไฟล์', emoji: '👤' },
];

interface GameLayoutProps {
  children: ReactNode;
}

export default function GameLayout({ children }: GameLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const money = 12450;
  const level = 7;
  const exp = 340;
  const expNeeded = 500;

  function handleLogout() {
    toast({ title: '👋 ออกจากระบบแล้ว', description: 'แล้วพบกันใหม่!' });
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 h-14 glass-card border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors active:scale-95"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🏙️</span>
            <h1 className="text-lg font-bold tracking-tight text-primary" style={{ fontFamily: 'Syne' }}>
              BeanCity
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-secondary/80 rounded-full px-3 py-1.5">
            <Coins className="w-4 h-4 text-[hsl(var(--game-gold))]" />
            <span className="font-mono-game text-sm font-bold">{formatNumber(money)}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-secondary/80 rounded-full px-3 py-1.5">
            <Star className="w-4 h-4 text-[hsl(var(--game-exp))]" />
            <span className="font-mono-game text-sm font-bold">Lv.{level}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors active:scale-95"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky top-14 left-0 z-30 h-[calc(100vh-3.5rem)] w-64 bg-sidebar border-r flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}
          
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto relative z-10 bg-sidebar">
            {NAV_ITEMS.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97]",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md glow-pink"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t bg-sidebar relative z-10">
            <div className="glass-card rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>EXP</span>
                <span className="font-mono-game">{exp}/{expNeeded}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[hsl(var(--game-exp))] rounded-full transition-all duration-500"
                  style={{ width: `${(exp / expNeeded) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">BeanBuilder</p>
                  <p className="text-xs text-muted-foreground font-mono-game">Level {level} • ⭐ P.1</p>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors active:scale-[0.97]"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
