import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X, Sun, Moon, Search } from 'lucide-react';
import { AppSidebar } from './app-sidebar';
import { AiAssistant } from '@/components/features/ai-assistant';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';

export function AppShellLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const setAiOpen = useAppStore((s) => s.setAiOpen);

  const cycleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <div className="hidden lg:block lg:shrink-0">
        <AppSidebar />
      </div>

      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            'absolute left-0 top-0 h-full transition-transform',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <AppSidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
          <button
            type="button"
            className="rounded-md p-2 hover:bg-accent lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Buscar activos, alertas, usuarios..."
              className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={cycleTheme}
              className="rounded-md p-2 hover:bg-accent"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="hidden rounded-md border border-brand/40 bg-brand/10 px-3 py-2 text-xs font-medium text-foreground hover:bg-brand/20 sm:inline-flex"
            >
              ✨ Asistente IA
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      <AiAssistant />
    </div>
  );
}
