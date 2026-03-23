import { TrendingUp, Building2, Star, Clock, ArrowUpRight } from 'lucide-react';
import { formatNumber, getExpForLevel } from '@/lib/game-logic';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RedeemCode from '@/components/RedeemCode';
import VisitCity from '@/components/VisitCity';
import CoinIcon from '@/components/CoinIcon';

const dailyQuests = [
  { name: 'สร้างตึก 3 หลัง', progress: 2, total: 3 },
  { name: 'ขายสินค้า 5 ชิ้น', progress: 3, total: 5 },
  { name: 'เข้าเยี่ยมเมืองคนอื่น', progress: 0, total: 1 },
];

const recentActivity = [
  { text: 'สร้าง Café ที่ตำแหน่ง (2,3)', time: '5 นาทีที่แล้ว', icon: '☕' },
  { text: 'ขาย ชาเขียวมัทฉะ ให้ MintCity', time: '12 นาทีที่แล้ว', icon: '🍵' },
  { text: 'ได้รับโบนัส Café × Park +10%', time: '20 นาทีที่แล้ว', icon: '✨' },
  { text: 'อัพเกรด Bakery เป็น Lv.3', time: '1 ชม. ที่แล้ว', icon: '🧁' },
  { text: 'CaféKing ซื้อ ลาเต้อาร์ต จากร้านคุณ', time: '2 ชม. ที่แล้ว', icon: '🛒' },
];

export default function Dashboard() {
  const { profile } = useAuth();

  const { data: buildingCount = 0 } = useQuery({
    queryKey: ['building-count', profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { count } = await supabase
        .from('buildings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile!.id);
      return count ?? 0;
    },
  });

  const level = profile?.level ?? 1;
  const exp = profile?.exp ?? 0;
  const expNeeded = getExpForLevel(level);
  const coins = profile?.coins ?? 0;

  const stats = [
    { label: 'เงินทั้งหมด', value: coins, icon: 'coin' as const },
    { label: 'รายได้/ชม.', value: 580, emoji: '💰' },
    { label: 'จำนวนตึก', value: buildingCount, emoji: '🏗️' },
    { label: 'อันดับ', value: 3, emoji: '🏆' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Syne' }}>
          สวัสดี, {profile?.display_name ?? 'ผู้เล่น'}! 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">ยินดีต้อนรับกลับมาสร้างเมืองของคุณ</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4 space-y-2 hover:shadow-xl hover:shadow-pink-200/20 transition-shadow duration-300">
            <div className="flex items-center justify-between">
              {'icon' in stat && stat.icon === 'coin' ? (
                <CoinIcon size={28} className="animate-bounce-gentle" />
              ) : (
                <span className="text-2xl animate-bounce-gentle">{'emoji' in stat ? stat.emoji : ''}</span>
              )}
              <ArrowUpRight className="w-4 h-4 text-[hsl(var(--game-exp))]" />
            </div>
            <p className="font-mono-game text-xl font-bold">{formatNumber(stat.value)}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* EXP & Level */}
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-slide-up lg:col-span-1" style={{ animationDelay: '0.15s' }}>
          <h2 className="font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" /> เลเวล & EXP
          </h2>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary animate-pulse-glow">
              <span className="text-2xl font-bold font-mono-game">{level}</span>
            </div>
            <p className="text-sm text-muted-foreground">Level {level}</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>EXP</span>
              <span className="font-mono-game">{exp}/{expNeeded}</span>
            </div>
            <Progress value={(exp / expNeeded) * 100} className="h-3" />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            อีก <span className="font-mono-game font-bold text-foreground">{expNeeded - exp}</span> EXP จะเลเวลอัพ!
          </p>
        </div>

        {/* Daily Quests */}
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-slide-up lg:col-span-1" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> เควสประจำวัน
          </h2>
          <div className="space-y-3">
            {dailyQuests.map((q, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span>{q.name}</span>
                  <span className="font-mono-game text-xs text-muted-foreground">{q.progress}/{q.total}</span>
                </div>
                <Progress value={(q.progress / q.total) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-slide-up lg:col-span-1" style={{ animationDelay: '0.25s' }}>
          <h2 className="font-semibold flex items-center gap-2">📋 กิจกรรมล่าสุด</h2>
          <div className="space-y-3">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-lg shrink-0 mt-0.5 animate-bounce-gentle" style={{ animationDelay: `${i * 0.15}s` }}>{act.icon}</span>
                <div className="min-w-0">
                  <p className="text-foreground leading-snug">{act.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Redeem Code + Visit City */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <RedeemCode />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <div className="glass-card rounded-2xl p-5">
            <VisitCity />
          </div>
        </div>
      </div>
    </div>
  );
}
