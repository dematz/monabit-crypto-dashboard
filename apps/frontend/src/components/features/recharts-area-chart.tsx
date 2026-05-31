import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { PricePoint } from '@monabit/shared-types';

const RechartsAreaChart = lazy(() =>
  import('./recharts-area-chart-impl').then((m) => ({ default: m.AreaChartImpl })),
);

type AreaChartProps = {
  data: PricePoint[];
  stroke: string;
  symbol: string;
  currency: 'USD' | 'EUR';
};

export function LazyAreaChart({ data, stroke, symbol, currency }: AreaChartProps) {
  return (
    <Suspense fallback={<Skeleton className="h-72 w-full rounded-xl" />}>
      <RechartsAreaChart data={data} stroke={stroke} symbol={symbol} currency={currency} />
    </Suspense>
  );
}
