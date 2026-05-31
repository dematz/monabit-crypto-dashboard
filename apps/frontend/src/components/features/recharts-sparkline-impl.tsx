import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { useChartColors } from '@/hooks/use-chart-colors';

type SparklineProps = {
  data: number[];
  positive: boolean;
};

export function SparklineImpl({ data, positive }: SparklineProps) {
  const colors = useChartColors();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data.map((v, i) => ({ i, v }))}
        margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
      >
        <Line
          type="monotone"
          dataKey="v"
          stroke={positive ? colors.success : colors.danger}
          strokeWidth={1.6}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
