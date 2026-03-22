import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/game-logic';

const ITEMS = [
  { id: '1', icon: '☕', name: 'กาแฟดริป', qty: 12, rarity: 'common' as const },
  { id: '2', icon: '🍰', name: 'เค้กช็อคโกแลต', qty: 5, rarity: 'uncommon' as const },
  { id: '3', icon: '⚡', name: 'EXP Boost x2', qty: 2, rarity: 'rare' as const },
  { id: '4', icon: '🎀', name: 'ป้ายไฟนีออน', qty: 1, rarity: 'legendary' as const },
  { id: '5', icon: '🧁', name: 'คัพเค้กสตรอว์เบอร์รี่', qty: 8, rarity: 'common' as const },
  { id: '6', icon: '🍵', name: 'ชาเขียวพรีเมียม', qty: 3, rarity: 'uncommon' as const },
  { id: '7', icon: '💎', name: 'คริสตัลเมือง', qty: 1, rarity: 'legendary' as const },
  { id: '8', icon: '🥐', name: 'ครัวซองต์', qty: 15, rarity: 'common' as const },
];

const RARITY_STYLES = {
  common: 'border-border text-muted-foreground',
  uncommon: 'border-[hsl(var(--game-exp))] text-[hsl(var(--game-exp))]',
  rare: 'border-[hsl(var(--game-rare))] text-[hsl(var(--game-rare))]',
  legendary: 'border-[hsl(var(--game-legendary))] text-[hsl(var(--game-legendary))]',
};

const RARITY_LABELS = {
  common: 'ธรรมดา',
  uncommon: 'พิเศษ',
  rare: 'หายาก',
  legendary: 'ตำนาน',
};

export default function Inventory() {
  return (
    <div className="space-y-5 max-w-4xl">
      <div className="animate-slide-up">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Syne' }}>🎒 กระเป๋าไอเทม</h1>
        <p className="text-sm text-muted-foreground mt-0.5">ไอเทมทั้งหมด {ITEMS.length} ชิ้น</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {ITEMS.map(item => (
          <div key={item.id} className="glass-card rounded-2xl p-4 text-center space-y-2 hover:shadow-lg transition-shadow duration-300">
            <div className="text-4xl">{item.icon}</div>
            <h3 className="text-sm font-semibold truncate">{item.name}</h3>
            <span className={cn(
              "inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border",
              RARITY_STYLES[item.rarity]
            )}>
              {RARITY_LABELS[item.rarity]}
            </span>
            <p className="font-mono-game text-xs text-muted-foreground">×{item.qty}</p>
          </div>
        ))}
        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 12 - ITEMS.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="border-2 border-dashed border-border rounded-2xl aspect-square flex items-center justify-center text-muted-foreground/20 text-2xl">
            +
          </div>
        ))}
      </div>
    </div>
  );
}
