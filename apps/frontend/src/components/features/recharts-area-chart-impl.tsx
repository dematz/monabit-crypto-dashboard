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
import { useChartColors } from '@/hooks/use-chart-colors';

type AreaChartProps = {
  data: PricePoint[];
  stroke: string;
  symbol: string;
  currency: 'USD' | 'EUR';
};

export function AreaChartImpl({ data, stroke, symbol, currency }: AreaChartProps) {
  const colors = useChartColors();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.5} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0.08} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={colors.border} strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="t"
          stroke={colors.border}
          tick={{ fill: colors.foreground, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={40}
        />
        <YAxis
          stroke={colors.border}
          tick={{ fill: colors.foreground, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={80}
          domain={['dataMin', 'dataMax']}
          tickFormatter={(v: number) => formatCurrency(v, currency)}
        />
        <Tooltip
          contentStyle={{
            background: colors.popover,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            color: colors.popoverForeground,
            fontSize: 12,
          }}
          labelStyle={{ color: colors.mutedForeground }}
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
