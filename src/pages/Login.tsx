import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, UserPlus, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (user) {
    navigate('/dashboard');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: '⚠️ กรุณากรอกข้อมูลให้ครบ', variant: 'destructive' });
      return;
    }
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, displayName || undefined);
      if (error) {
        toast({ title: '❌ สมัครไม่สำเร็จ', description: error, variant: 'destructive' });
      } else {
        toast({ title: '✅ สมัครสำเร็จ!', description: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ' });
        setIsSignUp(false);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: '❌ เข้าสู่ระบบไม่สำเร็จ', description: error, variant: 'destructive' });
      } else {
        navigate('/dashboard');
      }
    }
    setLoading(false);
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
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-10 max-w-sm w-full mx-4 text-center space-y-6 glow-pink">
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

          {/* Form */}
          <div className="space-y-3 text-left">
            {isSignUp && (
              <div className="relative animate-slide-up">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ชื่อในเกม"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="pl-10 rounded-xl h-11"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="อีเมล"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10 rounded-xl h-11"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="รหัสผ่าน"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 rounded-xl h-11"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full h-12 rounded-xl text-base font-semibold gap-2 transition-all duration-200 active:scale-[0.97]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSignUp ? (
              <><UserPlus className="w-5 h-5" /> สมัครสมาชิก</>
            ) : (
              <><LogIn className="w-5 h-5" /> เข้าสู่ระบบ</>
            )}
          </Button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-primary hover:underline transition-colors"
          >
            {isSignUp ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}
          </button>

          <p className="text-[10px] text-muted-foreground/60">
            เชื่อมต่อ Discord ได้ภายหลังในหน้าโปรไฟล์
          </p>
        </form>
      </div>
    </div>
  );
}
