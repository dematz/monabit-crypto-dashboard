import { useEffect, useRef, useState } from 'react';
import type { z } from 'zod';
import { useAppStore } from '@/stores/app-store';
import { wsPriceUpdateSchema } from '@/lib/schemas';

const WS_URL = import.meta.env.VITE_WS_URL as string;

export type LivePrice = z.infer<typeof wsPriceUpdateSchema>;

export function useBinanceWs() {
  const [livePrices, setLivePrices] = useState<Record<string, LivePrice>>({});
  const [reconnectKey, setReconnectKey] = useState(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!WS_URL) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const token = useAppStore.getState().token;
    if (!token) return;

    const url = WS_URL + (WS_URL.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(token);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event: MessageEvent) => {
      try {
        const raw = JSON.parse(event.data);
        if (raw.error) return;
        const parsed = wsPriceUpdateSchema.safeParse(raw);
        if (parsed.success) {
          setLivePrices((prev) => ({
            ...prev,
            [parsed.data.symbol.toUpperCase()]: parsed.data,
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
