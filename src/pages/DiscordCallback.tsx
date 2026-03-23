import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function DiscordCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errorParam = params.get('error');

    if (errorParam) {
      setError('Discord ปฏิเสธการเข้าถึง');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (!code) {
      setError('ไม่พบรหัสยืนยันจาก Discord');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    (async () => {
      try {
        const redirectUri = `${window.location.origin}/auth/discord/callback`;

        const { data, error: fnError } = await supabase.functions.invoke('discord-auth', {
          body: { action: 'exchange_code', code, redirect_uri: redirectUri },
        });

        if (fnError || data?.error) {
          setError(data?.error || fnError?.message || 'เกิดข้อผิดพลาด');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Set session with returned tokens
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        if (sessionError) {
          setError(sessionError.message);
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        navigate('/dashboard');
      } catch (e: any) {
        setError(e.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด');
        setTimeout(() => navigate('/'), 3000);
      }
    })();
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(340 30% 97%) 0%, hsl(330 40% 92%) 40%, hsl(335 50% 88%) 100%)' }}
    >
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="relative z-10 glass-card rounded-3xl p-10 max-w-sm w-full mx-4 text-center space-y-4">
        {error ? (
          <>
            <div className="text-5xl">❌</div>
            <h2 className="text-lg font-bold text-destructive">เข้าสู่ระบบไม่สำเร็จ</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground">กำลังกลับหน้าหลัก...</p>
          </>
        ) : (
          <>
            <div className="text-5xl animate-float">🏙️</div>
            <h2 className="text-lg font-bold">กำลังเชื่อมต่อ Discord...</h2>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">กรุณารอสักครู่</p>
          </>
        )}
      </div>
    </div>
  );
}
