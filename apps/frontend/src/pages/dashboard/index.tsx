import { useQuery } from '@tanstack/react-query';
import { KpiCard } from '@/components/features/kpi-card';
import { PriceChart } from '@/components/features/price-chart';
import { CryptoTable } from '@/components/features/crypto-table';
import { fetchMarketOverview } from '@/services/crypto-api';
import { formatCompact } from '@/lib/format';
import { useAppStore } from '@/stores/app-store';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardPage() {
  const currency = useAppStore((s) => s.currency);

  const { data: market, isLoading } = useQuery({
    queryKey: ['market-overview'],
    queryFn: fetchMarketOverview,
    refetchInterval: 120_000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Global Market</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A panoramic view of the crypto market in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading || !market ? (
          <>
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </>
        ) : (
          <>
            <KpiCard
              label="Market Cap Total"
              value={formatCompact(market.data.total_market_cap.usd, currency)}
              change={market.data.market_cap_change_percentage_24h_usd}
              spark={[]}
              accent="brand"
            />
            <KpiCard
              label="24h Volume"
              value={formatCompact(market.data.total_volume.usd, currency)}
              change={0}
              spark={[]}
              accent="info"
            />
            <KpiCard
              label="BTC Dominance"
              value={`${market.data.market_cap_percentage.btc.toFixed(2)}%`}
              change={0}
              spark={[]}
              accent="warning"
            />
          </>
        )}
      </div>

      <PriceChart />
      <CryptoTable />
    </div>
  );
}
