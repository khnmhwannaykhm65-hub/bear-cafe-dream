import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  BUILDINGS, GRID_SIZE, createEmptyGrid, calcBuildingIncome, calcTotalCityIncome,
  getActiveBonuses, formatNumber, type BuildingType, type PlacedBuilding
} from '@/lib/game-logic';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ShopModal from '@/components/ShopModal';
import CoinIcon from '@/components/CoinIcon';

type Mode = 'view' | 'build' | 'move' | 'delete';

export default function CityBuilder() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [grid, setGrid] = useState(() => createEmptyGrid());
  const [mode, setMode] = useState<Mode>('view');
  const [selectedBuild, setSelectedBuild] = useState<BuildingType>('cafe');
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [moveSource, setMoveSource] = useState<[number, number] | null>(null);
  const [shopModal, setShopModal] = useState<{ type: BuildingType; row: number; col: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase
        .from('buildings')
        .select('*')
        .eq('user_id', profile.id);
      if (data) {
        const g = createEmptyGrid();
        for (const b of data) {
          if (b.grid_row < GRID_SIZE && b.grid_col < GRID_SIZE) {
            g[b.grid_row][b.grid_col] = {
              type: b.building_type as BuildingType,
              level: b.building_level,
              row: b.grid_row,
              col: b.grid_col,
            };
          }
        }
        setGrid(g);
      }
      setLoading(false);
    })();
  }, [profile]);

  const totalIncome = useMemo(() => calcTotalCityIncome(grid), [grid]);
  const bonuses = useMemo(() => getActiveBonuses(grid), [grid]);
  const selectedBuilding = selectedCell ? grid[selectedCell[0]][selectedCell[1]] : null;
  const selectedInfo = selectedBuilding ? calcBuildingIncome(selectedBuilding, grid) : null;

  async function handleCellClick(r: number, c: number) {
    if (!profile) return;

    if (mode === 'build') {
      if (!grid[r][c]) {
        const def = BUILDINGS[selectedBuild];
        if ((profile.coins ?? 0) < def.cost) {
          toast({ title: '❌ เงินไม่พอ!', description: `ต้องการ ${def.cost} เหรียญ`, variant: 'destructive' });
          return;
        }

        const { error } = await supabase.from('buildings').insert({
          user_id: profile.id,
          building_type: selectedBuild,
          building_level: 1,
          grid_row: r,
          grid_col: c,
        });

        if (!error) {
          await supabase.from('profiles').update({
            coins: (profile.coins ?? 0) - def.cost,
            updated_at: new Date().toISOString(),
          }).eq('id', profile.id);

          const newGrid = grid.map(row => [...row]);
          newGrid[r][c] = { type: selectedBuild, level: 1, row: r, col: c };
          setGrid(newGrid);
          setSelectedCell([r, c]);
          refreshProfile();
          toast({ title: `🏗️ สร้าง ${def.nameTh} สำเร็จ!` });
        }
      }
    } else if (mode === 'delete') {
      if (grid[r][c]) {
        await supabase.from('buildings')
          .delete()
          .eq('user_id', profile.id)
          .eq('grid_row', r)
          .eq('grid_col', c);

        const newGrid = grid.map(row => [...row]);
        newGrid[r][c] = null;
        setGrid(newGrid);
        setSelectedCell(null);
        toast({ title: '🗑️ ลบอาคารแล้ว' });
      }
    } else if (mode === 'move') {
      if (!moveSource && grid[r][c]) {
        setMoveSource([r, c]);
      } else if (moveSource) {
        if (!grid[r][c]) {
          await supabase.from('buildings')
            .update({ grid_row: r, grid_col: c })
            .eq('user_id', profile.id)
            .eq('grid_row', moveSource[0])
            .eq('grid_col', moveSource[1]);

          const newGrid = grid.map(row => [...row]);
          const bld = { ...newGrid[moveSource[0]][moveSource[1]]!, row: r, col: c };
          newGrid[r][c] = bld;
          newGrid[moveSource[0]][moveSource[1]] = null;
          setGrid(newGrid);
        }
        setMoveSource(null);
      }
    } else {
      setSelectedCell(grid[r][c] ? [r, c] : null);
    }
  }

  async function handleUpgrade() {
    if (!selectedCell || !selectedBuilding || !profile) return;
    const def = BUILDINGS[selectedBuilding.type];
    const cost = def.cost * selectedBuilding.level;
    if (selectedBuilding.level >= def.maxLevel) {
      toast({ title: '⚠️ เลเวลสูงสุดแล้ว', variant: 'destructive' });
      return;
    }
    if ((profile.coins ?? 0) < cost) {
      toast({ title: '❌ เงินไม่พอ!', variant: 'destructive' });
      return;
    }

    await supabase.from('buildings')
      .update({ building_level: selectedBuilding.level + 1 })
      .eq('user_id', profile.id)
      .eq('grid_row', selectedCell[0])
      .eq('grid_col', selectedCell[1]);

    await supabase.from('profiles').update({
      coins: (profile.coins ?? 0) - cost,
      updated_at: new Date().toISOString(),
    }).eq('id', profile.id);

    const newGrid = grid.map(row => [...row]);
    newGrid[selectedCell[0]][selectedCell[1]] = { ...selectedBuilding, level: selectedBuilding.level + 1 };
    setGrid(newGrid);
    refreshProfile();
    toast({ title: `⬆️ อัพเกรด ${def.nameTh} เป็น Lv.${selectedBuilding.level + 1}!` });
  }

  const buildingCount = grid.flat().filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2 animate-slide-up">
          <span className="text-4xl animate-float">🏙️</span>
          <p className="text-muted-foreground text-sm">กำลังโหลดเมือง...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 max-w-6xl">
      {/* Left - Grid */}
      <div className="flex-1 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Syne' }}>🏙️ {profile?.city_name ?? 'เมืองของฉัน'}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              ตึก {buildingCount}/{GRID_SIZE * GRID_SIZE} • รายได้ <span className="font-mono-game text-foreground font-bold">{formatNumber(totalIncome)}</span>/ชม.
            </p>
          </div>
        </div>

        {/* Mode buttons */}
        <div className="flex gap-2 flex-wrap">
          {([['view', '👁️ ดู'], ['build', '🔨 สร้าง'], ['move', '↔️ ย้าย'], ['delete', '🗑️ ลบ']] as [Mode, string][]).map(([m, label]) => (
            <Button
              key={m}
              variant={mode === m ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setMode(m); setMoveSource(null); setSelectedCell(null); }}
              className={cn("rounded-xl active:scale-[0.97] transition-all", mode === m && "glow-pink")}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Build selector */}
        {mode === 'build' && (
          <div className="glass-card rounded-2xl p-3 animate-slide-up">
            <p className="text-xs text-muted-foreground mb-2">เลือกอาคาร:</p>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {Object.values(BUILDINGS).map(b => (
                <button
                  key={b.type}
                  onClick={() => setSelectedBuild(b.type)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all active:scale-95",
                    selectedBuild === b.type ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-secondary"
                  )}
                >
                  <span className="text-2xl animate-bounce-gentle">{b.icon}</span>
                  <span className="truncate w-full text-center">{b.nameTh}</span>
                  <span className="font-mono-game text-[10px] text-muted-foreground flex items-center gap-0.5"><CoinIcon size={10} />{b.cost}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="glass-card rounded-2xl p-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
            {Array.from({ length: GRID_SIZE }).map((_, r) =>
              Array.from({ length: GRID_SIZE }).map((_, c) => {
                const bld = grid[r][c];
                const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
                const isMoveSource = moveSource && moveSource[0] === r && moveSource[1] === c;
                const def = bld ? BUILDINGS[bld.type] : null;
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={cn(
                      "aspect-square rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-xs active:scale-95 relative overflow-hidden group",
                      bld
                        ? "bg-card border-pink-200 hover:border-primary shadow-sm"
                        : "bg-secondary/40 border-dashed border-border hover:bg-secondary/60",
                      isSelected && "ring-2 ring-primary ring-offset-2",
                      isMoveSource && "ring-2 ring-[hsl(var(--game-gold))] ring-offset-2 animate-pulse",
                      mode === 'delete' && bld && "hover:bg-destructive/10 hover:border-destructive",
                      mode === 'build' && !bld && "hover:bg-primary/5 hover:border-primary/30"
                    )}
                  >
                    {bld ? (
                      <>
                        <span className="text-2xl sm:text-3xl group-hover:animate-wiggle transition-transform">{def!.icon}</span>
                        <span className="font-mono-game text-[9px] text-muted-foreground mt-0.5">Lv.{bld.level}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground/30 text-lg">+</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {mode === 'move' && (
          <p className="text-sm text-muted-foreground text-center">
            {moveSource ? '🔹 เลือกช่องว่างเพื่อวางตึก' : '🔹 เลือกตึกที่ต้องการย้าย'}
          </p>
        )}
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-72 shrink-0 space-y-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full rounded-xl">
            <TabsTrigger value="info" className="rounded-lg flex-1">ข้อมูล</TabsTrigger>
            <TabsTrigger value="bonus" className="rounded-lg flex-1">โบนัส</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-3">
            {selectedBuilding && selectedInfo ? (
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <div className="text-center">
                  <span className="text-4xl animate-bounce-gentle">{BUILDINGS[selectedBuilding.type].icon}</span>
                  <h3 className="font-bold mt-1">{BUILDINGS[selectedBuilding.type].nameTh}</h3>
                  <p className="text-xs text-muted-foreground">{BUILDINGS[selectedBuilding.type].description}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">เลเวล</span>
                    <span className="font-mono-game font-bold">{selectedBuilding.level}/{BUILDINGS[selectedBuilding.type].maxLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">รายได้พื้นฐาน</span>
                    <span className="font-mono-game flex items-center gap-1"><CoinIcon size={12} /> {selectedInfo.base}/ชม.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">โบนัส</span>
                    <span className="font-mono-game text-[hsl(var(--game-exp))]">+{selectedInfo.bonus}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">รวม</span>
                    <span className="font-mono-game font-bold text-primary flex items-center gap-1"><CoinIcon size={12} /> {selectedInfo.total}/ชม.</span>
                  </div>
                </div>
                {selectedInfo.activeRules.length > 0 && (
                  <div className="space-y-1 pt-2 border-t">
                    <p className="text-xs font-semibold text-muted-foreground">โบนัสที่ใช้งาน:</p>
                    {selectedInfo.activeRules.map((rule, i) => (
                      <div key={i} className="text-xs bg-[hsl(var(--game-exp))]/10 text-[hsl(var(--game-exp))] rounded-lg px-2 py-1">
                        ✅ {rule.label}
                      </div>
                    ))}
                  </div>
                )}
                {BUILDINGS[selectedBuilding.type].hasShop && (
                  <Button
                    size="sm"
                    className="w-full rounded-xl mt-2 active:scale-[0.97]"
                    onClick={() => setShopModal({ type: selectedBuilding.type, row: selectedCell![0], col: selectedCell![1] })}
                  >
                    🏪 จัดการร้านค้า
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl active:scale-[0.97]"
                  onClick={handleUpgrade}
                  disabled={selectedBuilding.level >= BUILDINGS[selectedBuilding.type].maxLevel}
                >
                  ⬆️ อัพเกรด (<CoinIcon size={12} className="mx-0.5" /> {BUILDINGS[selectedBuilding.type].cost * selectedBuilding.level})
                </Button>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 text-center text-sm text-muted-foreground">
                <span className="text-3xl block mb-2 animate-float">🏙️</span>
                คลิกที่อาคารเพื่อดูรายละเอียด
              </div>
            )}
          </TabsContent>

          <TabsContent value="bonus" className="mt-3">
            <div className="glass-card rounded-2xl p-4 space-y-2">
              <h3 className="font-semibold text-sm mb-3">คู่โบนัสการวางอาคาร</h3>
              {bonuses.map(({ rule, active }, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 text-xs rounded-xl px-3 py-2 transition-colors",
                    active
                      ? "bg-[hsl(var(--game-exp))]/10 text-[hsl(var(--game-exp))]"
                      : "bg-secondary/50 text-muted-foreground"
                  )}
                >
                  <span>{active ? '✅' : '⬜'}</span>
                  <span className="flex-1">{rule.label}</span>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground pt-2 text-center">
                วางอาคารที่เข้าคู่กันติดกันเพื่อรับโบนัสรายได้!
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="glass-card rounded-2xl p-4 space-y-2">
          <h3 className="font-semibold text-sm">📊 สรุปเมือง</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-secondary/50 rounded-xl p-2 text-center">
              <p className="font-mono-game font-bold text-lg">{buildingCount}</p>
              <p className="text-muted-foreground">อาคาร</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-2 text-center">
              <p className="font-mono-game font-bold text-lg text-primary">{formatNumber(totalIncome)}</p>
              <p className="text-muted-foreground">รายได้/ชม.</p>
            </div>
          </div>
        </div>
      </div>

      {shopModal && (
        <ShopModal
          open={!!shopModal}
          onClose={() => setShopModal(null)}
          buildingType={shopModal.type}
          row={shopModal.row}
          col={shopModal.col}
        />
      )}
    </div>
  );
}
