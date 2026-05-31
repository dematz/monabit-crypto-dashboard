import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type ChangeIndicatorProps = {
  value: number;
  badge?: boolean;
  className?: string;
};

export function ChangeIndicator({ value, badge, className }: ChangeIndicatorProps) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium tabular-nums',
        positive ? 'text-success' : 'text-danger',
        badge &&
          (positive
            ? 'rounded-full px-2 py-0.5 text-xs bg-success/15'
            : 'rounded-full px-2 py-0.5 text-xs bg-danger/15'),
        className,
      )}
    >
      {positive ? (
        <ArrowUpRight className="h-3.5 w-3.5" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" />
      )}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}
