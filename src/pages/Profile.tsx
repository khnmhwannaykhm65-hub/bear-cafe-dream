import { Progress } from '@/components/ui/progress';
import { getExpForLevel, formatNumber } from '@/lib/game-logic';

export default function Profile() {
  const player = {
    name: 'BeanBuilder',
    level: 7,
    prestige: 1,
    exp: 340,
    money: 12450,
    buildings: 8,
    shopItems: 3,
    cityName: 'Bean Town',
    joinedDate: '15 ม.ค. 2569',
    discordTag: 'BeanBuilder#1234',
  };
  const expNeeded = getExpForLevel(player.level);

  const statsGrid = [
    { label: 'เลเวล', value: player.level, icon: '⭐' },
    { label: 'เกียรติยศ', value: `P.${player.prestige}`, icon: '👑' },
    { label: 'จำนวนตึก', value: player.buildings, icon: '🏗️' },
    { label: 'สินค้าในร้าน', value: player.shopItems, icon: '🛍️' },
    { label: 'เงินทั้งหมด', value: formatNumber(player.money), icon: '🪙' },
    { label: 'เมือง', value: player.cityName, icon: '🏙️' },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="animate-slide-up">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Syne' }}>👤 โปรไฟล์</h1>
      </div>

      {/* Profile card */}
      <div className="glass-card rounded-2xl p-6 space-y-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <h2 className="text-xl font-bold">{player.name}</h2>
            <p className="text-sm text-muted-foreground">{player.discordTag}</p>
            <p className="text-xs text-muted-foreground mt-0.5">เข้าร่วมเมื่อ {player.joinedDate}</p>
          </div>
        </div>

        {/* EXP bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>EXP Level {player.level}</span>
            <span className="font-mono-game">{player.exp}/{expNeeded}</span>
          </div>
          <Progress value={(player.exp / expNeeded) * 100} className="h-3" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        {statsGrid.map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 text-center space-y-1">
            <span className="text-2xl">{stat.icon}</span>
            <p className="font-mono-game font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
