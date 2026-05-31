import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PricePoint } from '@monabit/shared-types';
import { formatCurrency } from '@/lib/format';

type AreaChartProps = {
  data: PricePoint[];
  stroke: string;
  symbol: string;
  currency: 'USD' | 'EUR';
};

export function AreaChartImpl({ data, stroke, symbol, currency }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="t"
          stroke="var(--color-muted-foreground)"
          tickLine={false}
          axisLine={false}
          fontSize={11}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          width={60}
          domain={['dataMin', 'dataMax']}
          tickFormatter={(v: number) => formatCurrency(v, currency)}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-popover)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            color: 'var(--color-popover-foreground)',
            fontSize: 12,
          }}
          labelStyle={{ color: 'var(--color-muted-foreground)' }}
          formatter={(v: number) => [formatCurrency(v, currency), symbol]}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={stroke}
          strokeWidth={2.2}
          fill="url(#priceFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
