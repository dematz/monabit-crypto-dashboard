import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Search,
  Star,
} from "lucide-react";
import { fetchTop10 } from "@/services/crypto-api";
import { formatCompact, formatCurrency } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertModal } from "./alert-modal";
import { toDisplayAsset, type DisplayCryptoAsset } from "@/types";
import { Line, LineChart, ResponsiveContainer } from "recharts";

type Filter = "all" | "favorites" | "gainers" | "losers";

export function CryptoTable() {
  const currency = useAppStore((s) => s.currency);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [alertAsset, setAlertAsset] = useState<DisplayCryptoAsset | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["top-crypto"],
    queryFn: async () => {
      const res = await fetchTop10();
      return res.data.map((a, i) => toDisplayAsset(a, i));
    },
    refetchInterval: 60_000,
  });

  const rows = useMemo(() => {
    const base = data ?? [];
    return base
      .filter((a) =>
        query
          ? a.name.toLowerCase().includes(query.toLowerCase()) ||
            a.symbol.toLowerCase().includes(query.toLowerCase())
          : true,
      )
      .filter((a) => {
        if (filter === "favorites") return favorites.includes(a.id);
        if (filter === "gainers") return a.change24h >= 0;
        if (filter === "losers") return a.change24h < 0;
        return true;
      });
  }, [data, query, filter, favorites]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "favorites", label: "Favoritos" },
    { id: "gainers", label: "Ganadores" },
    { id: "losers", label: "Perdedores" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="text-base font-semibold">Top 10 Criptomonedas</h2>
          <p className="text-xs text-muted-foreground">
            Datos actualizados cada 60s desde CoinGecko
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="h-9 w-48 rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="inline-flex rounded-lg border border-border bg-background p-1">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  filter === f.id
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Activo</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-right">24h %</th>
              <th className="hidden px-4 py-3 text-right md:table-cell">Market Cap</th>
              <th className="hidden px-4 py-3 text-right lg:table-cell">Volumen 24h</th>
              <th className="hidden px-4 py-3 lg:table-cell">Tendencia 7d</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td colSpan={9} className="px-4 py-3">
                      <Skeleton className="h-10 w-full rounded-md" />
                    </td>
                  </tr>
                ))
              : rows.map((a) => {
                  const fav = favorites.includes(a.id);
                  const positive = a.change24h >= 0;
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-border/60 transition-colors hover:bg-accent/40"
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(a.id)}
                          className={cn(
                            "rounded-md p-1.5 transition-colors",
                            fav
                              ? "text-yellow-400 hover:bg-yellow-400/10"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground",
                          )}
                          aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
                        >
                          <Star
                            className={cn("h-4 w-4", fav && "fill-current")}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{a.rank}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-base font-semibold">
                            {a.logo}
                          </div>
                          <div>
                            <p className="font-medium">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {formatCurrency(a.price, currency)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 font-medium tabular-nums",
                            positive ? "text-success" : "text-danger",
                          )}
                        >
                          {positive ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          )}
                          {Math.abs(a.change24h).toFixed(2)}%
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-right tabular-nums md:table-cell">
                        {formatCompact(a.marketCap, currency)}
                      </td>
                      <td className="hidden px-4 py-3 text-right tabular-nums lg:table-cell">
                        {formatCompact(a.volume24h, currency)}
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <div className="h-10 w-28">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={a.sparkline.map((v, i) => ({ i, v }))}
                              margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
                            >
                              <Line
                                type="monotone"
                                dataKey="v"
                                stroke={
                                  positive ? "var(--color-success)" : "var(--color-danger)"
                                }
                                strokeWidth={1.6}
                                dot={false}
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setAlertAsset(a)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          aria-label="Crear alerta"
                        >
                          <Bell className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Sin resultados para los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AlertModal asset={alertAsset} onClose={() => setAlertAsset(null)} />
    </div>
  );
}
