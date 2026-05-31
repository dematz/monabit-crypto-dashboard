import { Monitor, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/app-store';
import type { Theme, Currency } from '@/types';
import { cn } from '@/lib/utils';

const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Oscuro', icon: Moon },
  { id: 'system', label: 'Sistema', icon: Monitor },
];

const CURRENCIES: Currency[] = ['USD', 'EUR'];

export function SettingsPage() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const currency = useAppStore((s) => s.currency);
  const setCurrency = useAppStore((s) => s.setCurrency);
  const refresh = useAppStore((s) => s.refreshInterval);
  const setRefresh = useAppStore((s) => s.setRefreshInterval);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Preferencias</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajustá la experiencia visual y los datos del dashboard.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold">Tema</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Elegí cómo se ve MonaBit. La opción Sistema sigue tu configuración del SO.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {THEMES.map((t) => {
            const Icon = t.icon;
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  toast.success(`Tema: ${t.label}`);
                }}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors',
                  active
                    ? 'border-brand bg-brand/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold">Divisa base</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Moneda para precios, market cap y volumen.
        </p>
        <div className="mt-4 inline-flex rounded-lg border border-border bg-background p-1">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                currency === c
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Intervalo de actualización</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Frecuencia con la que se refrescan los datos de mercado.
            </p>
          </div>
          <span className="rounded-md bg-accent px-2.5 py-1 text-sm font-semibold tabular-nums">
            {refresh}s
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={120}
          step={5}
          value={refresh}
          onChange={(e) => setRefresh(Number(e.target.value))}
          className="mt-4 w-full accent-[var(--color-brand)]"
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>5s</span>
          <span>60s</span>
          <span>120s</span>
        </div>
      </section>
    </div>
  );
}
