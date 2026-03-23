import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CoinIcon from '@/components/CoinIcon';

const GACHA_ITEMS = [
  { icon: '☕', name: 'กาแฟดริป', rarity: 'common' },
  { icon: '🧁', name: 'คัพเค้ก', rarity: 'common' },
  { icon: '🍵', name: 'ชาเขียวพรีเมียม', rarity: 'uncommon' },
  { icon: '⚡', name: 'EXP Boost x2', rarity: 'rare' },
  { icon: '💎', name: 'คริสตัลเมือง', rarity: 'legendary' },
];

const SPIN_PRIZES = ['💰 100', '⚡ EXP x2', '💰 50', '🎁 ลัง', '💰 200', '💎 คริสตัล', '💰 25', '⭐ P.Point'];

export default function MiniGames() {
  const { toast } = useToast();
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [gachaResult, setGachaResult] = useState<typeof GACHA_ITEMS[number] | null>(null);
  const [gachaAnimating, setGachaAnimating] = useState(false);

  function doGacha() {
    setGachaAnimating(true);
    setGachaResult(null);
    setTimeout(() => {
      const weights = [40, 30, 18, 10, 2];
      const total = weights.reduce((a, b) => a + b);
      let rand = Math.random() * total;
      let idx = 0;
      for (let i = 0; i < weights.length; i++) {
        rand -= weights[i];
        if (rand <= 0) { idx = i; break; }
      }
      setGachaResult(GACHA_ITEMS[idx]);
      setGachaAnimating(false);
      toast({ title: `🎰 ได้รับ ${GACHA_ITEMS[idx].icon} ${GACHA_ITEMS[idx].name}!` });
    }, 1500);
  }

  function doSpin() {
    setSpinning(true);
    setSpinResult(null);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * SPIN_PRIZES.length);
      setSpinResult(idx);
      setSpinning(false);
      toast({ title: `🎡 ได้รับ ${SPIN_PRIZES[idx]}!` });
    }, 2000);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="animate-slide-up">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Syne' }}>🎰 มินิเกม</h1>
        <p className="text-sm text-muted-foreground mt-0.5">ลุ้นรางวัลเพื่อพัฒนาเมืองของคุณ</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Gacha */}
        <div className="glass-card rounded-2xl p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="text-center">
            <span className="text-4xl">🎰</span>
            <h2 className="font-bold text-lg mt-2" style={{ fontFamily: 'Syne' }}>กาชา</h2>
            <p className="text-sm text-muted-foreground">สุ่มไอเทมจากกล่องลึกลับ</p>
          </div>

          <div className="flex items-center justify-center h-24">
            {gachaAnimating ? (
              <div className="text-5xl animate-bounce">🎁</div>
            ) : gachaResult ? (
              <div className="text-center animate-slide-up">
                <span className="text-5xl">{gachaResult.icon}</span>
                <p className="text-sm font-semibold mt-1">{gachaResult.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{gachaResult.rarity}</p>
              </div>
            ) : (
              <span className="text-5xl opacity-30">❓</span>
            )}
          </div>

          <Button onClick={doGacha} disabled={gachaAnimating} className="w-full rounded-xl active:scale-[0.97]">
            {gachaAnimating ? '🔄 กำลังสุ่ม...' : <span className="flex items-center gap-1">🎰 สุ่ม 1 ครั้ง (<CoinIcon size={14} /> 50)</span>}
          </Button>
        </div>

        {/* Daily Spin */}
        <div className="glass-card rounded-2xl p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="text-center">
            <span className="text-4xl">🎡</span>
            <h2 className="font-bold text-lg mt-2" style={{ fontFamily: 'Syne' }}>วงล้อรายวัน</h2>
            <p className="text-sm text-muted-foreground">หมุนฟรีวันละ 1 ครั้ง</p>
          </div>

          <div className="relative flex items-center justify-center h-24">
            <div className={`grid grid-cols-4 gap-1 text-center ${spinning ? 'animate-pulse' : ''}`}>
              {SPIN_PRIZES.map((p, i) => (
                <div
                  key={i}
                  className={`text-xs p-1.5 rounded-lg transition-all ${
                    spinResult === i ? 'bg-primary text-primary-foreground scale-110 ring-2 ring-primary ring-offset-2' : 'bg-secondary/60'
                  }`}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>

          <Button onClick={doSpin} disabled={spinning} variant="outline" className="w-full rounded-xl active:scale-[0.97]">
            {spinning ? '🔄 กำลังหมุน...' : '🎡 หมุนวงล้อ (ฟรี)'}
          </Button>
        </div>
      </div>
    </div>
  );
}
