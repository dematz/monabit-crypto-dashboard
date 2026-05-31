import { useEffect, useRef, useState } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL as string;

type WsPriceUpdate = {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high: number;
  low: number;
};

export type LivePrice = WsPriceUpdate;

export function useBinanceWs() {
  const [livePrices, setLivePrices] = useState<Record<string, LivePrice>>({});
  const [reconnectKey, setReconnectKey] = useState(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!WS_URL) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data: WsPriceUpdate = JSON.parse(event.data);
        if (data.symbol) {
          setLivePrices((prev) => ({
            ...prev,
            [data.symbol.toUpperCase()]: data,
          }));
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(
        () => {
          setReconnectKey((k) => k + 1);
        },
        3000 + Math.random() * 4000,
      );
    };

    ws.onerror = () => {
      ws.close();
    };

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current = null;
      ws.close();
    };
  }, [reconnectKey]);

  return { livePrices };
}
