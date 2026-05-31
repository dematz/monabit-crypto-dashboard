import { useMemo, useState, memo } from 'react';
import { Bell, Star } from 'lucide-react';
import { formatCompact, formatCurrency } from '@/lib/format';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ChangeIndicator } from '@/components/ui/change-indicator';
import { SearchInput } from '@/components/ui/search-input';
import { CryptoIcon } from '@/components/ui/crypto-icon';
import { AlertModal } from './alert-modal';
import { type DisplayCryptoAsset } from '@/types';
import { Sparkline } from './recharts-sparkline';
import { useBinanceWs } from '@/hooks/use-binance-ws';
import { useTop10Crypto } from '@/hooks/use-top10-crypto';

const SYMBOL_MAP: Record<string, string> = {
  BTCUSDT: 'bitcoin',
  ETHUSDT: 'ethereum',
  BNBUSDT: 'binancecoin',
  SOLUSDT: 'solana',
  XRPUSDT: 'ripple',
  ADAUSDT: 'cardano',
  DOGEUSDT: 'dogecoin',
  AVAXUSDT: 'avalanche-2',
  DOTUSDT: 'polkadot',
};

type Filter = 'all' | 'favorites' | 'gainers' | 'losers';

const CryptoTableRow = memo(function CryptoTableRow({
  a,
  currency,
  fav,
  onToggleFavorite,
  onSetAlert,
}: {
  a: DisplayCryptoAsset & { volume24h: number };
  currency: 'USD' | 'EUR';
  fav: boolean;
  onToggleFavorite: (id: string) => void;
  onSetAlert: (asset: DisplayCryptoAsset) => void;
}) {
  const positive = a.change24h >= 0;
  return (
    <tr className="border-b border-border/60 transition-colors hover:bg-accent/40">
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => onToggleFavorite(a.id)}
          className={cn(
            'rounded-md p-1.5 transition-colors',
            fav
              ? 'text-yellow-400 hover:bg-yellow-400/10'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={cn('h-4 w-4', fav && 'fill-current')} />
        </button>
      </td>
      <td className="px-4 py-3 text-muted-foreground tabular-nums">{a.rank}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <CryptoIcon src={a.logo} symbol={a.symbol} />
          <div>
            <p className="font-medium">{a.name}</p>
            <p className="text-xs text-muted-foreground">{a.symbol}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-medium tabular-nums">
        {formatCurrency(a.price, currency)}
      </td>
      <td className="px-4 py-3 text-right">
        <ChangeIndicator value={a.change24h} />
      </td>
      <td className="hidden px-4 py-3 text-right tabular-nums md:table-cell">
        {formatCompact(a.marketCap, currency)}
      </td>
      <td className="hidden px-4 py-3 text-right tabular-nums lg:table-cell">
        {formatCompact(a.volume24h, currency)}
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">
        <div className="h-10 w-28">
          <Sparkline data={a.sparkline} positive={positive} />
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => onSetAlert(a)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Create alert"
        >
          <Bell className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
});

export function CryptoTable() {
  const currency = useAppStore((s) => s.currency);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const { livePrices } = useBinanceWs();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [alertAsset, setAlertAsset] = useState<DisplayCryptoAsset | null>(null);

  const { data, isLoading } = useTop10Crypto();

  const rows = useMemo(() => {
    const base = data ?? [];
    return base
      .map((a) => {
        const symbol = Object.keys(SYMBOL_MAP).find((s) => SYMBOL_MAP[s] === a.id);
        const live = symbol ? livePrices[symbol] : undefined;
        if (live) {
          return { ...a, price: live.price, change24h: live.change24h, volume24h: live.volume };
        }
        return a;
      })
      .filter((a) =>
        query
          ? a.name.toLowerCase().includes(query.toLowerCase()) ||
            a.symbol.toLowerCase().includes(query.toLowerCase())
          : true,
      )
      .filter((a) => {
        if (filter === 'favorites') return favorites.includes(a.id);
        if (filter === 'gainers') return a.change24h >= 0;
        if (filter === 'losers') return a.change24h < 0;
        return true;
      });
  }, [data, query, filter, favorites, livePrices]);

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'gainers', label: 'Gainers' },
    { id: 'losers', label: 'Losers' },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="text-base font-semibold">Top 10 Cryptocurrencies</h2>
          <p className="text-xs text-muted-foreground">
            Real-time prices via Binance &middot; Market data from CoinGecko
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={query} onChange={setQuery} />
          <div className="inline-flex rounded-lg border border-border bg-background p-1">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  filter === f.id
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">24h %</th>
              <th className="hidden px-4 py-3 text-right md:table-cell">Market Cap</th>
              <th className="hidden px-4 py-3 text-right lg:table-cell">24h Volume</th>
              <th className="hidden px-4 py-3 lg:table-cell">7d Trend</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td colSpan={9} className="px-4 py-3">
                      <Skeleton className="h-10 w-full rounded-md" />
                    </td>
                  </tr>
                ))
              : rows.map((a) => (
                  <CryptoTableRow
                    key={a.id}
                    a={a}
                    currency={currency}
                    fav={favorites.includes(a.id)}
                    onToggleFavorite={toggleFavorite}
                    onSetAlert={setAlertAsset}
                  />
                ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No results for current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AlertModal key={alertAsset?.id} asset={alertAsset} onClose={() => setAlertAsset(null)} />
    </div>
  );
}
