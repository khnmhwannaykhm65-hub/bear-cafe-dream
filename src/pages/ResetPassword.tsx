import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock, Loader2 } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: '⚠️ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: '❌ เปลี่ยนรหัสผ่านไม่สำเร็จ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ เปลี่ยนรหัสผ่านสำเร็จ!' });
      navigate('/dashboard');
    }
    setLoading(false);
  }

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background grid-pattern">
        <div className="glass-card rounded-2xl p-8 text-center space-y-4 max-w-sm">
          <p className="text-muted-foreground">ลิงก์ไม่ถูกต้อง</p>
          <Button onClick={() => navigate('/')}>กลับหน้าแรก</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-pattern">
      <form onSubmit={handleReset} className="glass-card rounded-2xl p-8 max-w-sm w-full space-y-4 animate-slide-up">
        <h1 className="text-xl font-bold text-center" style={{ fontFamily: 'Syne' }}>🔐 ตั้งรหัสผ่านใหม่</h1>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="password" placeholder="รหัสผ่านใหม่" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 rounded-xl h-11" />
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-xl">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'เปลี่ยนรหัสผ่าน'}
        </Button>
      </form>
    </div>
  );
}
