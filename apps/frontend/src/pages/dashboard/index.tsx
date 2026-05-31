import { useQuery } from '@tanstack/react-query';
import { KpiCard } from '@/components/features/kpi-card';
import { PriceChart } from '@/components/features/price-chart';
import { CryptoTable } from '@/components/features/crypto-table';
import { fetchMarketOverview } from '@/services/crypto-api';
import { formatCompact } from '@/lib/format';
import { generateSparkline } from '@/lib/sparkline';
import { useAppStore } from '@/stores/app-store';
import { useRefreshMs } from '@/hooks/use-refresh-ms';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';

function formatTimeAgo(fetchedAt: string | undefined): string | null {
  if (!fetchedAt) return null;
  const d = new Date(fetchedAt);
  const diff = Date.now() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

export function DashboardPage() {
  const currency = useAppStore((s) => s.currency);
  const refreshMs = useRefreshMs();

  const { data: market, isLoading } = useQuery({
    queryKey: ['market-overview'],
    queryFn: fetchMarketOverview,
    refetchInterval: refreshMs,
  });

  const lastUpdated = formatTimeAgo(market?.fetched_at);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Market"
        description="A panoramic view of the crypto market in real time."
      >
        {lastUpdated && (
          <span className="ml-auto text-xs text-muted-foreground">Updated {lastUpdated}</span>
        )}
      </PageHeader>

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
              spark={generateSparkline(market.data.market_cap_change_percentage_24h_usd)}
              accent="brand"
            />
            <KpiCard
              label="24h Volume"
              value={formatCompact(market.data.total_volume.usd, currency)}
              change={0}
              spark={generateSparkline(0)}
              accent="info"
            />
            <KpiCard
              label="BTC Dominance"
              value={`${market.data.market_cap_percentage.btc.toFixed(2)}%`}
              change={0}
              spark={generateSparkline(0)}
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
