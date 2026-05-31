import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import type { DisplayCryptoAsset } from '@/types';
import { formatCurrency } from '@/lib/format';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';

type Props = { asset: DisplayCryptoAsset | null; onClose: () => void };

export function AlertModal({ asset, onClose }: Props) {
  const currency = useAppStore((s) => s.currency);
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [target, setTarget] = useState('');

  useEffect(() => {
    if (asset) {
      setCondition('above');
      setTarget(asset.price.toFixed(2));
    }
  }, [asset]);

  if (!asset) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(target);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error('Enter a valid target price');
      return;
    }
    toast.success(
      `Alert created: ${asset.symbol} ${condition === 'above' ? '≥' : '≤'} ${formatCurrency(n, currency)}`,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-popover p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-lg">
            {asset.logo}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Create alert</p>
            <h3 className="text-base font-semibold">
              {asset.name} <span className="text-muted-foreground">({asset.symbol})</span>
            </h3>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Condition
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['above', 'below'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={cn(
                    'rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                    condition === c
                      ? 'border-brand bg-brand/15 text-foreground'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground',
                  )}
                >
                  {c === 'above' ? 'Above' : 'Below'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Target price ({currency})
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-base tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Current price: {formatCurrency(asset.price, currency)}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
            >
              Create alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
