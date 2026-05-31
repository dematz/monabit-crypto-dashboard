import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { DisplayCryptoAsset } from '@/types';

const RechartsSparkline = lazy(() =>
  import('./recharts-sparkline-impl').then((m) => ({ default: m.SparklineImpl })),
);

type SparklineProps = {
  data: number[];
  positive: boolean;
};

export function Sparkline({ data, positive }: SparklineProps) {
  return (
    <Suspense fallback={<Skeleton className="h-10 w-28 rounded-md" />}>
      <RechartsSparkline data={data} positive={positive} />
    </Suspense>
  );
}

export { type DisplayCryptoAsset };
