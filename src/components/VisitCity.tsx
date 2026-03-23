import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BUILDINGS, GRID_SIZE, type PlacedBuilding } from '@/lib/game-logic';
import { useToast } from '@/hooks/use-toast';
import CoinIcon from '@/components/CoinIcon';

interface CityOwner {
  name: string;
  cityName: string;
  level: number;
  prestige: number;
  grid: (PlacedBuilding | null)[][];
  shopItems: { icon: string; name: string; price: number; sold: number }[];
}

const SAMPLE_CITIES: CityOwner[] = [
  {
    name: 'CaféKing',
    cityName: 'Mocha Valley',
    level: 12,
    prestige: 3,
    grid: (() => {
      const g: (PlacedBuilding | null)[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
      g[0][0] = { type: 'cafe', level: 5, row: 0, col: 0 };
      g[0][1] = { type: 'park', level: 3, row: 0, col: 1 };
      g[1][0] = { type: 'bakery', level: 4, row: 1, col: 0 };
      g[1][1] = { type: 'cafe', level: 3, row: 1, col: 1 };
      g[2][2] = { type: 'fountain', level: 2, row: 2, col: 2 };
      g[2][3] = { type: 'house', level: 3, row: 2, col: 3 };
      g[3][1] = { type: 'tree', level: 2, row: 3, col: 1 };
      g[3][2] = { type: 'shop', level: 3, row: 3, col: 2 };
      g[4][4] = { type: 'park', level: 2, row: 4, col: 4 };
      return g;
    })(),
    shopItems: [
      { icon: '☕', name: 'ลาเต้สูตรพิเศษ', price: 75, sold: 412 },
      { icon: '🍵', name: 'ชาเขียวมัทฉะ', price: 45, sold: 234 },
      { icon: '🧁', name: 'คัพเค้กช็อก', price: 50, sold: 189 },
    ],
  },
  {
    name: 'MintCity',
    cityName: 'Mint Garden',
    level: 10,
    prestige: 2,
    grid: (() => {
      const g: (PlacedBuilding | null)[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
      g[0][2] = { type: 'park', level: 3, row: 0, col: 2 };
      g[1][1] = { type: 'house', level: 2, row: 1, col: 1 };
      g[1][2] = { type: 'cafe', level: 4, row: 1, col: 2 };
      g[1][3] = { type: 'tree', level: 2, row: 1, col: 3 };
      g[2][2] = { type: 'bakery', level: 3, row: 2, col: 2 };
      g[3][0] = { type: 'shop', level: 2, row: 3, col: 0 };
      g[4][1] = { type: 'fountain', level: 1, row: 4, col: 1 };
      return g;
    })(),
    shopItems: [
      { icon: '🍰', name: 'ชีสเค้กมิ้นต์', price: 65, sold: 189 },
      { icon: '🧋', name: 'มิ้นต์โกโก้', price: 40, sold: 302 },
    ],
  },
  {
    name: 'SugarRush',
    cityName: 'Sweet Haven',
    level: 8,
    prestige: 1,
    grid: (() => {
      const g: (PlacedBuilding | null)[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
      g[0][0] = { type: 'bakery', level: 5, row: 0, col: 0 };
      g[0][1] = { type: 'bakery', level: 3, row: 0, col: 1 };
      g[1][0] = { type: 'cafe', level: 2, row: 1, col: 0 };
      g[2][3] = { type: 'house', level: 2, row: 2, col: 3 };
      g[3][4] = { type: 'tree', level: 1, row: 3, col: 4 };
      g[4][0] = { type: 'shop', level: 2, row: 4, col: 0 };
      return g;
    })(),
    shopItems: [
      { icon: '🍩', name: 'โดนัทน้ำตาล', price: 25, sold: 567 },
      { icon: '🍪', name: 'คุกกี้บิ๊กไซส์', price: 30, sold: 445 },
    ],
  },
];

export default function VisitCity() {
  const { toast } = useToast();
  const [selectedCity, setSelectedCity] = useState<CityOwner | null>(null);

  function handleBuy(ownerName: string, itemName: string, price: number) {
    toast({ title: `🛒 ซื้อ ${itemName} จาก ${ownerName} สำเร็จ!`, description: `หักเหรียญ ${price}` });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold flex items-center gap-2" style={{ fontFamily: 'Syne' }}>
          🏘️ เยี่ยมชมเมืองคนอื่น
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">เดินเที่ยวเมืองเพื่อนแล้วซื้อของจากร้านได้!</p>
      </div>

      <div className="space-y-2">
        {SAMPLE_CITIES.map((city) => (
          <button
            key={city.name}
            onClick={() => setSelectedCity(city)}
            className="w-full flex items-center gap-3 glass-card rounded-xl px-4 py-3 hover:shadow-lg hover:shadow-pink-200/20 transition-all duration-200 active:scale-[0.98] text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">🏙️</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{city.name}</p>
              <p className="text-xs text-muted-foreground">{city.cityName} • Lv.{city.level} • ⭐ P.{city.prestige}</p>
            </div>
            <div className="text-xs text-muted-foreground">
              🏗️ {city.grid.flat().filter(Boolean).length} ตึก
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selectedCity} onOpenChange={(v) => !v && setSelectedCity(null)}>
        {selectedCity && (
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                🏙️ {selectedCity.cityName}
                <span className="text-sm font-normal text-muted-foreground">โดย {selectedCity.name}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="flex gap-3 text-center text-xs">
              <div className="bg-secondary/50 rounded-xl px-3 py-2 flex-1">
                <p className="font-bold">Lv.{selectedCity.level}</p>
                <p className="text-muted-foreground">เลเวล</p>
              </div>
              <div className="bg-secondary/50 rounded-xl px-3 py-2 flex-1">
                <p className="font-bold">P.{selectedCity.prestige}</p>
                <p className="text-muted-foreground">เกียรติยศ</p>
              </div>
              <div className="bg-secondary/50 rounded-xl px-3 py-2 flex-1">
                <p className="font-bold">{selectedCity.grid.flat().filter(Boolean).length}</p>
                <p className="text-muted-foreground">อาคาร</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">🗺️ แผนที่เมือง</h3>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                {Array.from({ length: GRID_SIZE }).map((_, r) =>
                  Array.from({ length: GRID_SIZE }).map((_, c) => {
                    const bld = selectedCity.grid[r][c];
                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                          bld ? 'bg-white border border-pink-200 shadow-sm' : 'bg-secondary/30 border border-dashed border-border/50'
                        }`}
                      >
                        {bld ? BUILDINGS[bld.type].icon : ''}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {selectedCity.shopItems.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2">🛍️ ร้านค้าของ {selectedCity.name}</h3>
                <div className="space-y-2">
                  {selectedCity.shopItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-secondary/30 rounded-xl px-3 py-2">
                      <span className="text-xl">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><CoinIcon size={10} /> {item.price} • ขายแล้ว {item.sold}</p>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-lg active:scale-[0.95] h-7 text-xs"
                        onClick={() => handleBuy(selectedCity.name, item.name, item.price)}
                      >
                        🛒 ซื้อ
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
