import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bitcoin, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/app-store';
import { supabase } from '@/services/supabase';
import { api } from '@/services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAppStore((s) => s.setSession);
  const existingUser = useAppStore((s) => s.user);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingUser) navigate('/');
  }, [existingUser, navigate]);

  async function fetchProfile(token: string) {
    const { user, profile } = await api.get<{
      user: { id: string; email: string; role: 'admin' | 'user' };
      profile: { display_name: string | null };
    }>('/auth/me');
    setSession(
      {
        id: user.id,
        name: profile.display_name ?? user.email.split('@')[0] ?? 'User',
        email: user.email,
        role: user.role === 'admin' ? 'Admin' : 'User',
      },
      token,
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'register' && !name)) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success('Check your email to confirm your account');
          setLoading(false);
          return;
        }
        await fetchProfile(data.session.access_token);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await fetchProfile(data.session.access_token);
      }
      toast.success(mode === 'login' ? 'Welcome to MonaBit' : 'Account created');
      navigate('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    toast.message('Google Sign-In is not available in local environment');
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background text-foreground lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[oklch(0.2_0.03_265)] via-[oklch(0.18_0.025_265)] to-[oklch(0.14_0.02_265)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(60% 50% at 20% 20%, oklch(0.82 0.22 152 / 0.18), transparent 60%), radial-gradient(40% 40% at 80% 80%, oklch(0.7 0.22 230 / 0.18), transparent 60%)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-brand-foreground">
              <Bitcoin className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-gradient-brand">
              MonaBit
            </span>
          </div>
          <h2 className="mt-10 max-w-md text-4xl font-semibold leading-tight">
            Crypto market intelligence,{' '}
            <span className="text-gradient-brand">all in one screen.</span>
          </h2>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Live KPIs, smart alerts, premium charts, and an AI assistant at your fingertips.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-brand-foreground">
              <Bitcoin className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold text-gradient-brand">MonaBit</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === 'login' ? 'Sign in' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'login'
              ? 'Access your personalized dashboard.'
              : 'Start monitoring the market in seconds.'}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or with your email
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'register' && (
              <Field label="Name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Your name"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@email.com"
                autoComplete="email"
              />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label={showPw ? 'Hide' : 'Show'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-semibold text-brand hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.4 39.6 16.1 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.7 35.6 44 30.2 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
