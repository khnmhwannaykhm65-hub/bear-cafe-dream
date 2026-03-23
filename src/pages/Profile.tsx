import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getExpForLevel, formatNumber } from '@/lib/game-logic';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, Save } from 'lucide-react';
import CoinIcon from '@/components/CoinIcon';

export default function Profile() {
  const { profile, updateProfile, user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [cityName, setCityName] = useState(profile?.city_name ?? '');

  const { data: buildingCount = 0 } = useQuery({
    queryKey: ['building-count-profile', profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { count } = await supabase.from('buildings').select('*', { count: 'exact', head: true }).eq('user_id', profile!.id);
      return count ?? 0;
    },
  });

  const { data: shopItemCount = 0 } = useQuery({
    queryKey: ['shop-item-count', profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { count } = await supabase.from('shop_items').select('*', { count: 'exact', head: true }).eq('user_id', profile!.id);
      return count ?? 0;
    },
  });

  if (!profile) return null;

  const expNeeded = getExpForLevel(profile.level);

  async function handleSave() {
    await updateProfile({
      display_name: displayName,
      city_name: cityName,
    } as any);
    setEditing(false);
    toast({ title: '✅ อัพเดตโปรไฟล์เรียบร้อย!' });
  }

  const statsGrid = [
    { label: 'เลเวล', value: profile.level, icon: '⭐' },
    { label: 'เกียรติยศ', value: `P.${profile.prestige}`, icon: '👑' },
    { label: 'จำนวนตึก', value: buildingCount, icon: '🏗️' },
    { label: 'สินค้าในร้าน', value: shopItemCount, icon: '🛍️' },
    { label: 'เงินทั้งหมด', value: formatNumber(profile.coins), useCoin: true },
    { label: 'เมือง', value: profile.city_name, icon: '🏙️' },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="animate-slide-up flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Syne' }}>👤 โปรไฟล์</h1>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl active:scale-[0.97]"
          onClick={() => editing ? handleSave() : setEditing(true)}
        >
          {editing ? <><Save className="w-4 h-4 mr-1" /> บันทึก</> : <><Pencil className="w-4 h-4 mr-1" /> แก้ไข</>}
        </Button>
      </div>

      {/* Profile card */}
      <div className="glass-card rounded-2xl p-6 space-y-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : '👤'}
          </div>
          <div className="flex-1">
            {editing ? (
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="rounded-xl font-bold text-lg" placeholder="ชื่อในเกม" />
            ) : (
              <h2 className="text-xl font-bold">{profile.display_name}</h2>
            )}
            {profile.discord_username && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                {profile.discord_username}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">เข้าร่วมเมื่อ {new Date(profile.created_at).toLocaleDateString('th-TH')}</p>
          </div>
        </div>

        {/* Discord Status */}
        <div className="bg-secondary/50 rounded-xl p-3 space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
            เชื่อมต่อ Discord
          </h3>
          <p className="text-sm text-muted-foreground">
            {profile.discord_id ? (
              <span className="text-[hsl(var(--game-exp))]">✅ เชื่อมต่อแล้ว — {profile.discord_username || profile.discord_id}</span>
            ) : (
              <span>❌ ยังไม่ได้เชื่อมต่อ — เข้าสู่ระบบผ่าน Discord เพื่อเชื่อมต่ออัตโนมัติ</span>
            )}
          </p>
        </div>

        {/* City Name */}
        {editing && (
          <div className="space-y-1 animate-slide-up">
            <label className="text-sm font-semibold">🏙️ ชื่อเมือง</label>
            <Input value={cityName} onChange={e => setCityName(e.target.value)} className="rounded-xl" placeholder="ชื่อเมืองของคุณ" />
          </div>
        )}

        {/* EXP bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>EXP Level {profile.level}</span>
            <span className="font-mono-game">{profile.exp}/{expNeeded}</span>
          </div>
          <Progress value={(profile.exp / expNeeded) * 100} className="h-3" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        {statsGrid.map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 text-center space-y-1 group">
            {'useCoin' in stat && stat.useCoin ? (
              <CoinIcon size={28} className="group-hover:animate-wiggle inline-block" />
            ) : (
              <span className="text-2xl group-hover:animate-wiggle inline-block">{stat.icon}</span>
            )}
            <p className="font-mono-game font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
