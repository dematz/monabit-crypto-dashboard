import { useEffect, useRef, useCallback, useState } from 'react';

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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (!WS_URL || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);

      ws.onmessage = (event) => {
        try {
          const data: WsPriceUpdate = JSON.parse(event.data);
          if (data.symbol) {
            setLivePrices((prev) => ({
              ...prev,
              [data.symbol.toUpperCase()]: data,
            }));
          }
        } catch {}
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (reconnectRef.current) clearTimeout(reconnectRef.current);
        reconnectRef.current = setTimeout(connect, 3000 + Math.random() * 4000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch {}
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  return { livePrices };
}
