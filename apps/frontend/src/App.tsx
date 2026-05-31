import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { lazy, Suspense, useEffect, useState, startTransition } from 'react';
import { ThemeManager } from '@/components/theme-manager';
import { AppShellLayout } from '@/components/layout/app-shell';
import { useAppStore } from '@/stores/app-store';
import { supabase } from '@/services/supabase';
import { api } from '@/services/api';

const LoginPage = lazy(() => import('@/pages/auth/login').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.DashboardPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/settings').then((m) => ({ default: m.SettingsPage })),
);
const UsersPage = lazy(() => import('@/pages/users').then((m) => ({ default: m.UsersPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

async function fetchProfile(token: string) {
  try {
    const { user, profile } = await api.get<{
      user: { id: string; email: string; role: 'admin' | 'user' };
      profile: { display_name: string | null } | null;
    }>('/auth/me');
    useAppStore.getState().setSession(
      {
        id: user.id,
        name: profile?.display_name ?? user.email.split('@')[0] ?? 'User',
        email: user.email,
        role: user.role === 'admin' ? 'Admin' : 'User',
      },
      token,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('deactivated') || message.includes('403')) {
      toast.error('Your account has been deactivated. Contact an administrator.');
      useAppStore.getState().logout();
    }
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAppStore((s) => s.user);
  const [waiting, setWaiting] = useState(() => window.location.hash.includes('access_token='));

  useEffect(() => {
    if (user) {
      startTransition(() => setWaiting(false));
      return;
    }
    if (!waiting) return;
    const timer = setTimeout(() => setWaiting(false), 5000);
    return () => clearTimeout(timer);
  }, [waiting, user]);

  if (waiting) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-brand">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

function PageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
    </div>
  );
}

export function App() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') &&
        session &&
        !useAppStore.getState().user
      ) {
        useAppStore.setState({ token: session.access_token });
        fetchProfile(session.access_token);
      }
    });

    const timer = setTimeout(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && !useAppStore.getState().user) {
        useAppStore.setState({ token: session.access_token });
        fetchProfile(session.access_token);
      }
    }, 100);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeManager />
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppShellLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
