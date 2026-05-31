import { KpiCard } from '@/components/features/kpi-card';
import { PriceChart } from '@/components/features/price-chart';
import { CryptoTable } from '@/components/features/crypto-table';
import { MARKET_KPIS } from '@/lib/mock-data';
import { formatCompact } from '@/lib/format';
import { useAppStore } from '@/stores/app-store';

export function DashboardPage() {
  const currency = useAppStore((s) => s.currency);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mercado global</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Una vista panorámica del estado del mercado cripto en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Market Cap Total"
          value={formatCompact(MARKET_KPIS.marketCap, currency)}
          change={MARKET_KPIS.marketCapChange}
          spark={MARKET_KPIS.marketCapSpark}
          accent="brand"
        />
        <KpiCard
          label="Volumen 24h"
          value={formatCompact(MARKET_KPIS.volume24h, currency)}
          change={MARKET_KPIS.volumeChange}
          spark={MARKET_KPIS.volumeSpark}
          accent="info"
        />
        <KpiCard
          label="Dominancia BTC"
          value={`${MARKET_KPIS.btcDominance.toFixed(2)}%`}
          change={MARKET_KPIS.btcDominanceChange}
          spark={MARKET_KPIS.dominanceSpark}
          accent="warning"
        />
      </div>

      <PriceChart />
      <CryptoTable />
    </div>
  );
}
