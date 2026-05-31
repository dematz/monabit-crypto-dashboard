import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

type Props = {
  label: string;
  value: string;
  change: number;
  spark: number[];
  accent?: "brand" | "info" | "warning";
};

export function KpiCard({ label, value, change, spark, accent = "brand" }: Props) {
  const positive = change >= 0;
  const stroke =
    accent === "info"
      ? "var(--color-chart-2)"
      : accent === "warning"
        ? "var(--color-chart-3)"
        : "var(--color-success)";
  const data = spark.map((v, i) => ({ i, v }));

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-brand/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            positive
              ? "bg-success/15 text-success"
              : "bg-danger/15 text-danger",
          )}
        >
          {positive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {Math.abs(change).toFixed(2)}%
        </span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 opacity-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.45} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={stroke}
              strokeWidth={2}
              fill={`url(#spark-${label})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
