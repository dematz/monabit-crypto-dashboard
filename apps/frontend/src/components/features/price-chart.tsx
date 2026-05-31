import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTop10, fetchCoinHistory } from '@/services/crypto-api';
import { toDisplayAsset } from '@/types';
import { formatCurrency } from '@/lib/format';
import { useAppStore } from '@/stores/app-store';
import { useRefreshMs } from '@/hooks/use-refresh-ms';
import { useChartColors } from '@/hooks/use-chart-colors';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { LazyAreaChart } from './recharts-area-chart';

const RANGES = ['1D', '7D', '1M'] as const;
type Range = (typeof RANGES)[number];

export function PriceChart() {
  const currency = useAppStore((s) => s.currency);
  const refreshMs = useRefreshMs();
  const [assetId, setAssetId] = useState('bitcoin');
  const [range, setRange] = useState<Range>('7D');

  const { data: assets } = useQuery({
    queryKey: ['top-crypto'],
    queryFn: async () => {
      const res = await fetchTop10();
      return res.data.map((a, i) => toDisplayAsset(a, i));
    },
    staleTime: refreshMs,
  });

  const asset = useMemo(() => assets?.find((a) => a.id === assetId), [assets, assetId]);

  const { data: history, isLoading } = useQuery({
    queryKey: ['price-history', assetId, range],
    queryFn: () => fetchCoinHistory(assetId, range),
    staleTime: Math.round(refreshMs / 2),
  });

  const positive = (asset?.change24h ?? 0) >= 0;
  const colors = useChartColors();
  const stroke = positive ? colors.success : colors.danger;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-xl font-semibold">
            {asset?.logo ?? '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="bg-transparent text-lg font-semibold tracking-tight focus:outline-none"
              >
                {(assets ?? []).map((a) => (
                  <option key={a.id} value={a.id} className="bg-popover text-foreground">
                    {a.name} ({a.symbol})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-2xl font-semibold tabular-nums">
              {asset ? formatCurrency(asset.price, currency) : '—'}{' '}
              {asset && (
                <span
                  className={cn(
                    'ml-2 text-sm font-medium',
                    positive ? 'text-success' : 'text-danger',
                  )}
                >
                  {asset.change24h > 0 ? '+' : ''}
                  {asset.change24h.toFixed(2)}%
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-background p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                range === r
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-72">
        {isLoading || !history ? (
          <Skeleton className="h-full w-full rounded-xl" />
        ) : (
          <LazyAreaChart
            data={history.data}
            stroke={stroke}
            symbol={asset?.symbol ?? ''}
            currency={currency}
          />
        )}
      </div>
    </div>
  );
}
