import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { type BuildingType, BUILDINGS } from '@/lib/game-logic';
import CoinIcon from '@/components/CoinIcon';

const PRODUCT_ICONS = ['☕', '🍵', '🧋', '🥐', '🍰', '🧁', '🍩', '🥧', '🍪', '🎂'];

interface ShopItem {
  id: string;
  icon: string;
  name: string;
  price: number;
  dailyLimit: number;
  soldToday: number;
}

interface ShopModalProps {
  open: boolean;
  onClose: () => void;
  buildingType: BuildingType;
  row: number;
  col: number;
}

const VISITORS = [
  { name: 'MintCity', item: 'ลาเต้อาร์ต', price: 55, time: '3 นาทีที่แล้ว' },
  { name: 'CaféKing', item: 'ชาเขียวมัทฉะ', price: 45, time: '8 นาทีที่แล้ว' },
  { name: 'SugarRush', item: 'คัพเค้ก', price: 30, time: '15 นาทีที่แล้ว' },
  { name: 'TeaLover', item: 'ชานมไข่มุก', price: 40, time: '22 นาทีที่แล้ว' },
];

const SALES_DATA = [
  { day: 'จ', value: 120 },
  { day: 'อ', value: 180 },
  { day: 'พ', value: 90 },
  { day: 'พฤ', value: 250 },
  { day: 'ศ', value: 310 },
  { day: 'ส', value: 280 },
  { day: 'อา', value: 200 },
];
const maxSales = Math.max(...SALES_DATA.map(d => d.value));

export default function ShopModal({ open, onClose, buildingType }: ShopModalProps) {
  const { toast } = useToast();
  const def = BUILDINGS[buildingType];
  const [items, setItems] = useState<ShopItem[]>([
    { id: '1', icon: '☕', name: 'ลาเต้อาร์ต', price: 55, dailyLimit: 50, soldToday: 23 },
    { id: '2', icon: '🍵', name: 'ชาเขียวมัทฉะ', price: 45, dailyLimit: 30, soldToday: 18 },
  ]);
  const [newIcon, setNewIcon] = useState('☕');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newLimit, setNewLimit] = useState('50');

  const totalRevenue = items.reduce((sum, i) => sum + (i.price * i.soldToday), 0);

  function addProduct() {
    if (!newName.trim() || !newPrice) {
      toast({ title: '⚠️ กรุณากรอกข้อมูลให้ครบ', variant: 'destructive' });
      return;
    }
    if (items.length >= 6) {
      toast({ title: '⚠️ เมนูเต็มแล้ว (สูงสุด 6 รายการ)', variant: 'destructive' });
      return;
    }
    setItems([...items, {
      id: Date.now().toString(),
      icon: newIcon,
      name: newName.trim(),
      price: parseInt(newPrice),
      dailyLimit: parseInt(newLimit) || 50,
      soldToday: 0,
    }]);
    setNewName('');
    setNewPrice('');
    toast({ title: `✅ เพิ่ม ${newIcon} ${newName.trim()} เข้าเมนูแล้ว!` });
  }

  function removeProduct(id: string) {
    setItems(items.filter(i => i.id !== id));
    toast({ title: '🗑️ ลบสินค้าออกจากเมนูแล้ว' });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="text-3xl">{def.icon}</span>
            จัดการ {def.nameTh}
          </DialogTitle>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-secondary/50 rounded-xl p-2">
            <p className="font-mono text-lg font-bold text-primary flex items-center justify-center gap-1"><CoinIcon size={16} /> {totalRevenue}</p>
            <p className="text-[10px] text-muted-foreground">รายได้วันนี้</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-2">
            <p className="font-mono text-lg font-bold">{items.reduce((s, i) => s + i.soldToday, 0)}</p>
            <p className="text-[10px] text-muted-foreground">ขายแล้ว</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-2">
            <p className="font-mono text-lg font-bold">{VISITORS.length}</p>
            <p className="text-[10px] text-muted-foreground">ลูกค้าล่าสุด</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">📋 เมนูร้าน ({items.length}/6)</h3>
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 bg-secondary/30 rounded-xl px-3 py-2">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><CoinIcon size={10} /> {item.price} • ขาย {item.soldToday}/{item.dailyLimit}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeProduct(item.id)} className="text-destructive h-7 px-2 rounded-lg">✕</Button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">ยังไม่มีสินค้า — เพิ่มเมนูด้านล่าง</div>
          )}
        </div>

        {/* Add Product */}
        <div className="space-y-2 border-t pt-3">
          <h3 className="font-semibold text-sm">➕ เพิ่มสินค้าใหม่</h3>
          <div className="flex gap-1 flex-wrap">
            {PRODUCT_ICONS.map(icon => (
              <button
                key={icon}
                onClick={() => setNewIcon(icon)}
                className={`w-8 h-8 rounded-lg text-lg transition-all active:scale-90 ${newIcon === icon ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-secondary'}`}
              >
                {icon}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="ชื่อสินค้า" value={newName} onChange={e => setNewName(e.target.value)} className="rounded-xl text-sm" />
            <Input type="number" placeholder="ราคา" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="rounded-xl text-sm" />
          </div>
          <div className="flex gap-2">
            <Input type="number" placeholder="จำนวน/วัน" value={newLimit} onChange={e => setNewLimit(e.target.value)} className="rounded-xl text-sm flex-1" />
            <Button onClick={addProduct} className="rounded-xl active:scale-[0.97]">เพิ่ม</Button>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="space-y-2 border-t pt-3">
          <h3 className="font-semibold text-sm">📊 ยอดขาย 7 วัน</h3>
          <div className="flex items-end gap-1 h-20">
            {SALES_DATA.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary/20 rounded-t-md transition-all hover:bg-primary/40"
                  style={{ height: `${(d.value / maxSales) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[9px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visitor Feed */}
        <div className="space-y-2 border-t pt-3">
          <h3 className="font-semibold text-sm">👥 ลูกค้าล่าสุด</h3>
          {VISITORS.map((v, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">👤</div>
              <div className="flex-1">
                <span className="font-medium">{v.name}</span>
                <span className="text-muted-foreground"> ซื้อ {v.item} (<CoinIcon size={10} className="inline" />{v.price})</span>
              </div>
              <span className="text-muted-foreground">{v.time}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
