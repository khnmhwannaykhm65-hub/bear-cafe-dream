import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getExpForLevel, formatNumber } from '@/lib/game-logic';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, Save, Link2 } from 'lucide-react';

export default function Profile() {
  const { profile, updateProfile, user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [cityName, setCityName] = useState(profile?.city_name ?? '');
  const [discordId, setDiscordId] = useState(profile?.discord_id ?? '');

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
      discord_id: discordId || null,
    } as any);
    setEditing(false);
    toast({ title: '✅ อัพเดตโปรไฟล์เรียบร้อย!' });
  }

  const statsGrid = [
    { label: 'เลเวล', value: profile.level, icon: '⭐' },
    { label: 'เกียรติยศ', value: `P.${profile.prestige}`, icon: '👑' },
    { label: 'จำนวนตึก', value: buildingCount, icon: '🏗️' },
    { label: 'สินค้าในร้าน', value: shopItemCount, icon: '🛍️' },
    { label: 'เงินทั้งหมด', value: formatNumber(profile.coins), icon: '🪙' },
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
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">เข้าร่วมเมื่อ {new Date(profile.created_at).toLocaleDateString('th-TH')}</p>
          </div>
        </div>

        {/* Discord Link */}
        <div className="bg-secondary/50 rounded-xl p-3 space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            เชื่อมต่อ Discord
          </h3>
          {editing ? (
            <Input
              value={discordId}
              onChange={e => setDiscordId(e.target.value)}
              placeholder="Discord User ID (เช่น 123456789012345678)"
              className="rounded-xl text-sm"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {profile.discord_id ? (
                <span className="text-[hsl(var(--game-exp))]">✅ เชื่อมต่อแล้ว — {profile.discord_username || profile.discord_id}</span>
              ) : (
                <span>❌ ยังไม่ได้เชื่อมต่อ — กดแก้ไขเพื่อเพิ่ม Discord ID</span>
              )}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground">
            ใส่ Discord User ID เพื่อให้บอทส่งรางวัลและแจ้งเตือนถึงคุณได้
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
            <span className="text-2xl group-hover:animate-wiggle inline-block">{stat.icon}</span>
            <p className="font-mono-game font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
