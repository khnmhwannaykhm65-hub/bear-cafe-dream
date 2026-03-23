import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect
  if (user) {
    navigate('/dashboard');
    return null;
  }

  async function handleDiscordLogin() {
    setLoading(true);
    setError(null);

    try {
      const redirectUri = `${window.location.origin}/auth/discord/callback`;

      const { data, error: fnError } = await supabase.functions.invoke('discord-auth', {
        body: { action: 'get_auth_url', redirect_uri: redirectUri },
      });

      if (fnError || data?.error) {
        setError(data?.error || fnError?.message || 'ไม่สามารถสร้างลิงก์ Discord ได้');
        setLoading(false);
        return;
      }

      // Redirect to Discord OAuth
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(340 30% 97%) 0%, hsl(330 40% 92%) 40%, hsl(335 50% 88%) 100%)' }}
    >
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
        <div className="glass-card rounded-3xl p-10 max-w-sm w-full mx-4 text-center space-y-6 glow-pink">
          {/* Logo */}
          <div className="space-y-3">
            <div className="text-6xl animate-float">🏙️</div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary" style={{ fontFamily: 'Syne', lineHeight: '1.1' }}>
              BeanCity
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              สร้างเมือง • เปิดร้าน • ค้าขาย
            </p>
          </div>

          {/* Discord Login Button */}
          <div className="space-y-3">
            <Button
              onClick={handleDiscordLogin}
              disabled={loading}
              size="lg"
              className="w-full h-14 rounded-xl text-base font-semibold gap-3 transition-all duration-200 active:scale-[0.97]"
              style={{ backgroundColor: '#5865F2', color: 'white' }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                  </svg>
                  เข้าสู่ระบบด้วย Discord
                </>
              )}
            </Button>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm text-destructive animate-slide-up">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground/80">
              กดปุ่มด้านบนเพื่อเชื่อมต่อบัญชี Discord ของคุณ
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              รูปโปรไฟล์และชื่อจะถูกซิงค์จาก Discord อัตโนมัติ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
