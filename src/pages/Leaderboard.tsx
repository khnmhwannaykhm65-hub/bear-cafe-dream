import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/game-logic';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CoinIcon from '@/components/CoinIcon';

const RANK_MEDALS = ['', '🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { profile } = useAuth();

  const { data: entries = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, city_name, coins, level')
        .order('coins', { ascending: false })
        .limit(20);
      return (data ?? []).map((e, i) => ({
        rank: i + 1,
        name: e.display_name,
        cityName: e.city_name,
        score: e.coins,
        me: e.id === profile?.id,
      }));
    },
  });

  const myEntry = entries.find(e => e.me);

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="animate-slide-up">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Syne' }}>🏆 อันดับผู้เล่น</h1>
        <p className="text-sm text-muted-foreground mt-0.5">จัดอันดับตามมูลค่าเมือง</p>
      </div>

      {myEntry && (
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4 glow-pink animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold font-mono-game text-primary">
            #{myEntry.rank}
          </div>
          <div className="flex-1">
            <p className="font-semibold">⭐ อันดับของคุณ</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">{myEntry.cityName} • <CoinIcon size={14} /> {formatNumber(myEntry.score)}</p>
          </div>
        </div>
      )}

      <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        {entries.map(entry => (
          <div
            key={entry.rank}
            className={cn(
              "glass-card rounded-2xl p-3 flex items-center gap-3 transition-shadow hover:shadow-lg duration-300",
              entry.me && "ring-2 ring-primary/30"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-mono-game",
              entry.rank <= 3 ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
            )}>
              {RANK_MEDALS[entry.rank] || `#${entry.rank}`}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {entry.me && '⭐ '}{entry.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">🏙️ {entry.cityName}</p>
            </div>
            <p className="font-mono-game text-sm font-bold flex items-center gap-1"><CoinIcon size={14} /> {formatNumber(entry.score)}</p>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <span className="text-4xl block mb-2">🏆</span>
            <p>ยังไม่มีผู้เล่นในอันดับ</p>
          </div>
        )}
      </div>
    </div>
  );
}
