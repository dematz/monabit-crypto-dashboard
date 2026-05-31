import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { CRYPTO_ASSETS } from "@/lib/mock-data";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Resumen del mercado hoy",
  "¿Qué activos están en verde?",
  "Análisis de Bitcoin",
  "Top 3 ganadores 24h",
];

function generateReply(input: string, currency: "USD" | "EUR"): string {
  const q = input.toLowerCase();
  const top = [...CRYPTO_ASSETS].sort((a, b) => b.change24h - a.change24h);
  const gainers = top.slice(0, 3);
  const losers = top.slice(-3).reverse();

  if (q.includes("resumen") || q.includes("mercado")) {
    return [
      "**Resumen de mercado**",
      `• Bitcoin cotiza a ${formatCurrency(CRYPTO_ASSETS[0]!.price, currency)} (${formatPercent(CRYPTO_ASSETS[0]!.change24h)} 24h).`,
      `• Ethereum a ${formatCurrency(CRYPTO_ASSETS[1]!.price, currency)} (${formatPercent(CRYPTO_ASSETS[1]!.change24h)} 24h).`,
      `• Sentimiento general: ${gainers.length > losers.length ? "optimista 🟢" : "cauteloso 🔴"}.`,
      `• Mayor ganador: **${gainers[0]!.symbol}** ${formatPercent(gainers[0]!.change24h)}.`,
    ].join("\n");
  }
  if (q.includes("verde") || q.includes("ganador")) {
    return `🟢 Activos en verde:\n${gainers
      .map((a) => `• ${a.name} (${a.symbol}): ${formatPercent(a.change24h)}`)
      .join("\n")}`;
  }
  if (q.includes("rojo") || q.includes("perdedor")) {
    return `🔴 Activos en rojo:\n${losers
      .map((a) => `• ${a.name} (${a.symbol}): ${formatPercent(a.change24h)}`)
      .join("\n")}`;
  }
  const match = CRYPTO_ASSETS.find(
    (a) => q.includes(a.name.toLowerCase()) || q.includes(a.symbol.toLowerCase()),
  );
  if (match) {
    return [
      `**${match.name} (${match.symbol})**`,
      `• Precio: ${formatCurrency(match.price, currency)}`,
      `• 24h: ${formatPercent(match.change24h)}`,
      `• Market Cap: ${formatCompact(match.marketCap, currency)}`,
      `• Volumen 24h: ${formatCompact(match.volume24h, currency)}`,
      match.change24h >= 0
        ? "Tendencia positiva en las últimas 24h."
        : "Tendencia bajista en las últimas 24h.",
    ].join("\n");
  }
  return "Puedo ayudarte con resúmenes de mercado, análisis por activo o las mayores variaciones. Probá con uno de los atajos.";
}

export function AiAssistant() {
  const open = useAppStore((s) => s.aiOpen);
  const setOpen = useAppStore((s) => s.setAiOpen);
  const currency = useAppStore((s) => s.currency);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy **MonaBit AI** 🤖 — preguntame por el resumen del mercado, un activo en particular o los mayores movimientos del día.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setMessages((m) => [...m, { role: "user", content: value }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", content: generateReply(value, currency) }]);
      setTyping(false);
    }, 600);
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex w-full max-w-md transform flex-col border-l border-border bg-surface shadow-2xl transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full",
      )}
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand/15 text-brand">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Asistente MonaBit</p>
            <p className="text-xs text-muted-foreground">IA de mercado · simulado</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Cerrar asistente"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-brand text-brand-foreground"
                  : "bg-accent text-foreground",
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-accent px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:240ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-border p-4">
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Preguntá lo que quieras..."
            className="h-11 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="grid h-11 w-11 place-items-center rounded-lg bg-brand text-brand-foreground hover:opacity-90"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
