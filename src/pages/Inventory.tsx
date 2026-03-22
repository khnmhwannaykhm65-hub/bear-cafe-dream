import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const RARITY_STYLES: Record<string, string> = {
  common: 'border-border text-muted-foreground',
  uncommon: 'border-[hsl(var(--game-exp))] text-[hsl(var(--game-exp))]',
  rare: 'border-[hsl(var(--game-rare))] text-[hsl(var(--game-rare))]',
  legendary: 'border-[hsl(var(--game-legendary))] text-[hsl(var(--game-legendary))]',
};

const RARITY_LABELS: Record<string, string> = {
  common: 'ธรรมดา',
  uncommon: 'พิเศษ',
  rare: 'หายาก',
  legendary: 'ตำนาน',
};

export default function Inventory() {
  const { profile } = useAuth();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory', profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', profile!.id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="animate-slide-up">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Syne' }}>🎒 กระเป๋าไอเทม</h1>
        <p className="text-sm text-muted-foreground mt-0.5">ไอเทมทั้งหมด {items.length} ชิ้น</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <span className="text-3xl animate-float">🎒</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {items.map(item => (
            <div key={item.id} className="glass-card rounded-2xl p-4 text-center space-y-2 hover:shadow-lg transition-shadow duration-300 group">
              <div className="text-4xl group-hover:animate-wiggle transition-transform">{item.item_icon}</div>
              <h3 className="text-sm font-semibold truncate">{item.item_name}</h3>
              <span className={cn(
                "inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                RARITY_STYLES[item.rarity] ?? RARITY_STYLES.common
              )}>
                {RARITY_LABELS[item.rarity] ?? 'ธรรมดา'}
              </span>
              <p className="font-mono-game text-xs text-muted-foreground">×{item.quantity}</p>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <span className="text-4xl block mb-2">📦</span>
              <p>ยังไม่มีไอเทม — เล่นมินิเกมหรือแลกโค้ดเพื่อรับไอเทม!</p>
            </div>
          )}
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 12 - items.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="border-2 border-dashed border-border rounded-2xl aspect-square flex items-center justify-center text-muted-foreground/20 text-2xl">
              +
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
