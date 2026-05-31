import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CRYPTO_ASSETS, buildPriceHistory } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const RANGES = ["1D", "7D", "1M"] as const;
type Range = (typeof RANGES)[number];

export function PriceChart() {
  const currency = useAppStore((s) => s.currency);
  const [assetId, setAssetId] = useState("bitcoin");
  const [range, setRange] = useState<Range>("7D");

  const asset = useMemo(() => CRYPTO_ASSETS.find((a) => a.id === assetId)!, [assetId]);

  const { data, isLoading } = useQuery({
    queryKey: ["price-history", assetId, range],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 280));
      return buildPriceHistory(assetId, range);
    },
    staleTime: 30_000,
  });

  const positive = asset.change24h >= 0;
  const stroke = positive ? "var(--color-success)" : "var(--color-danger)";

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-xl font-semibold">
            {asset.logo}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="bg-transparent text-lg font-semibold tracking-tight focus:outline-none"
              >
                {CRYPTO_ASSETS.map((a) => (
                  <option key={a.id} value={a.id} className="bg-popover text-foreground">
                    {a.name} ({a.symbol})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(asset.price, currency)}{" "}
              <span
                className={cn(
                  "ml-2 text-sm font-medium",
                  positive ? "text-success" : "text-danger",
                )}
              >
                {positive ? "+" : ""}
                {asset.change24h.toFixed(2)}%
              </span>
            </p>
          </div>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-background p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                range === r
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-72">
        {isLoading || !data ? (
          <Skeleton className="h-full w-full rounded-xl" />
        ) : (
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
                domain={["dataMin", "dataMax"]}
                tickFormatter={(v) => formatCurrency(v as number, currency)}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  color: "var(--color-popover-foreground)",
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--color-muted-foreground)" }}
                formatter={(v: number) => [formatCurrency(v, currency), asset.symbol]}
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
        )}
      </div>
    </div>
  );
}
