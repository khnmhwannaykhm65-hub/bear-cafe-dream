import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Gift, Sparkles, Loader2 } from 'lucide-react';

const DEMO_CODES: Record<string, { type: string; amount: number; desc: string }> = {
  'BEANCITY100': { type: 'coins', amount: 100, desc: '🪙 100 เหรียญ' },
  'WELCOME2024': { type: 'coins', amount: 500, desc: '🪙 500 เหรียญต้อนรับ' },
  'EXPBOOST': { type: 'exp', amount: 200, desc: '⭐ 200 EXP' },
  'VIPRANK': { type: 'role', amount: 0, desc: '👑 ยศ VIP ใน Discord' },
};

export default function RedeemCode() {
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleRedeem() {
    if (!code.trim()) {
      toast({ title: '⚠️ กรุณากรอกโค้ด', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setSuccess(null);

    // Demo mode - check local codes
    await new Promise(r => setTimeout(r, 1200));

    const found = DEMO_CODES[code.trim().toUpperCase()];
    if (found) {
      setSuccess(found.desc);
      toast({
        title: '🎉 แลกโค้ดสำเร็จ!',
        description: `ได้รับ ${found.desc}`,
      });
    } else {
      toast({
        title: '❌ โค้ดไม่ถูกต้อง',
        description: 'ตรวจสอบโค้ดแล้วลองใหม่อีกครั้ง',
        variant: 'destructive',
      });
    }

    setLoading(false);
    setCode('');
  }

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Gift className="w-5 h-5 text-primary" />
        <h2 className="font-semibold" style={{ fontFamily: 'Syne' }}>🎁 แลกโค้ด</h2>
      </div>
      <p className="text-xs text-muted-foreground">กรอกโค้ดเพื่อรับเหรียญ, EXP, ไอเทม หรือยศพิเศษใน Discord!</p>

      <div className="relative">
        <Input
          placeholder="กรอกโค้ดที่นี่..."
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleRedeem()}
          className="rounded-xl pr-24 h-12 text-center font-mono tracking-widest text-lg border-2 border-dashed border-primary/30 bg-primary/5 focus:border-primary focus:bg-white placeholder:text-sm placeholder:tracking-normal placeholder:font-sans transition-all"
          maxLength={20}
          disabled={loading}
        />
        <Button
          onClick={handleRedeem}
          disabled={loading || !code.trim()}
          size="sm"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg active:scale-[0.95] h-9"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> แลก</>}
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-[hsl(var(--game-exp))]/10 text-[hsl(var(--game-exp))] rounded-xl px-3 py-2 text-sm animate-slide-up">
          <span>🎉</span>
          <span>ได้รับ {success}</span>
        </div>
      )}

      <div className="text-[10px] text-muted-foreground/60 text-center space-y-0.5">
        <p>โค้ดทดสอบ: BEANCITY100, WELCOME2024, EXPBOOST, VIPRANK</p>
      </div>
    </div>
  );
}
