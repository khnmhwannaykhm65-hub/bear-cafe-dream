import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Login() {
  const navigate = useNavigate();

  const handleDiscordLogin = () => {
    // TODO: Replace with real Discord OAuth via Supabase
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(340 30% 97%) 0%, hsl(330 40% 92%) 40%, hsl(335 50% 88%) 100%)' }}
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-[15%] text-5xl animate-float opacity-60" style={{ animationDelay: '0s' }}>🏙️</div>
      <div className="absolute top-32 right-[20%] text-4xl animate-float opacity-50" style={{ animationDelay: '1s' }}>☕</div>
      <div className="absolute bottom-28 left-[25%] text-4xl animate-float opacity-40" style={{ animationDelay: '2s' }}>🌳</div>
      <div className="absolute bottom-40 right-[15%] text-5xl animate-float opacity-50" style={{ animationDelay: '0.5s' }}>🧁</div>
      <div className="absolute top-[45%] left-[8%] text-3xl animate-float opacity-30" style={{ animationDelay: '1.5s' }}>🏠</div>
      <div className="absolute top-[30%] right-[8%] text-3xl animate-float opacity-35" style={{ animationDelay: '2.5s' }}>⛲</div>

      {/* Main card */}
      <div className="relative z-10 animate-slide-up">
        <div className="glass-card rounded-3xl p-10 max-w-sm w-full mx-4 text-center space-y-8 glow-pink">
          {/* Logo */}
          <div className="space-y-3">
            <div className="text-6xl animate-float">🏙️</div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary" style={{ fontFamily: 'Syne', lineHeight: '1.1' }}>
              BeanCity
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              สร้างเมือง • เปิดร้าน • ค้าขาย<br />
              เชื่อมต่อกับ Discord ของคุณ
            </p>
          </div>

          {/* Discord Login */}
          <Button
            onClick={handleDiscordLogin}
            size="lg"
            className="w-full h-12 rounded-xl text-base font-semibold gap-3 transition-all duration-200 active:scale-[0.97]"
            style={{ 
              background: 'hsl(235 86% 65%)', 
              color: 'white',
              boxShadow: '0 4px 20px hsl(235 86% 65% / 0.3)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 71 55" fill="currentColor">
              <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 41 41 0 00-1.8 3.7 54 54 0 00-16.2 0A38 38 0 0025.4.3a.2.2 0 00-.2-.1 58.4 58.4 0 00-14.7 4.6.2.2 0 00-.1 0A60 60 0 00.4 43.5a.2.2 0 000 .2 58.8 58.8 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.7.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 42 42 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.4 36.4 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1 58.6 58.6 0 0017.7-9 .2.2 0 000-.2C68 19 64.2 10 60.2 5a.2.2 0 000-.1zM23.7 35.6c-3.4 0-6.2-3.1-6.2-7s2.7-7 6.2-7 6.3 3.2 6.2 7-2.8 7-6.2 7zm22.9 0c-3.4 0-6.2-3.1-6.2-7s2.7-7 6.2-7 6.3 3.2 6.2 7-2.7 7-6.2 7z"/>
            </svg>
            เข้าสู่ระบบด้วย Discord
          </Button>

          <p className="text-xs text-muted-foreground/60">
            เข้าสู่ระบบเพื่อเริ่มต้นสร้างเมืองของคุณ
          </p>
        </div>
      </div>
    </div>
  );
}
