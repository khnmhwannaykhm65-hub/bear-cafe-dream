import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SAMPLE_MARKET, MARKET_CATEGORIES, formatNumber, type MarketItem } from '@/lib/game-logic';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Marketplace() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const filtered = SAMPLE_MARKET.filter(item => {
    if (filter !== 'all' && item.cat !== filter) return false;
    if (search && !item.name.includes(search) && !item.shop.includes(search)) return false;
    return true;
  });

  function handleBuy(item: MarketItem) {
    if (item.mine) return;
    toast({ title: `🛒 ซื้อ ${item.name} สำเร็จ!`, description: `หัก 🪙 ${item.price} จากกระเป๋า` });
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="animate-slide-up">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Syne' }}>🏪 ตลาดกลาง</h1>
        <p className="text-sm text-muted-foreground mt-0.5">ซื้อขายสินค้าระหว่างผู้เล่น</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {MARKET_CATEGORIES.map(cat => (
            <Button
              key={cat.key}
              variant={filter === cat.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat.key)}
              className="rounded-xl active:scale-[0.97]"
            >
              {cat.icon} {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        {filtered.map(item => (
          <div key={item.id} className="glass-card rounded-2xl p-4 hover:shadow-xl hover:shadow-pink-200/20 transition-all duration-300 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary/60 flex items-center justify-center text-2xl shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{item.shop} • {item.city}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono-game font-bold text-primary">🪙 {formatNumber(item.price)}</p>
                <p className="text-[10px] text-muted-foreground">ขายแล้ว {item.sold} ชิ้น</p>
              </div>
              <Button
                size="sm"
                variant={item.mine ? 'secondary' : 'default'}
                disabled={item.mine}
                onClick={() => handleBuy(item)}
                className="rounded-xl active:scale-[0.97]"
              >
                {item.mine ? 'ร้านคุณ' : '🛒 ซื้อ'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <span className="text-4xl block mb-2">🔍</span>
          ไม่พบสินค้าที่ค้นหา
        </div>
      )}
    </div>
  );
}
