import WebSocket from 'ws';
import { z } from 'zod';
import { logger } from '../../shared/logger/index.js';
import { config } from '../../config/index.js';
import { setCache } from './crypto.cache.js';

const binanceTickerSchema = z.object({
  e: z.literal('24hrTicker'),
  s: z.string(),
  c: z.string(),
  P: z.string(),
  q: z.string(),
  h: z.string(),
  l: z.string(),
});

type PriceCallback = (data: {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high: number;
  low: number;
}) => void;

const STREAM_SYMBOLS = [
  'btcusdt',
  'ethusdt',
  'bnbusdt',
  'solusdt',
  'xrpusdt',
  'usdcusdc',
  'adausdt',
  'dogeusdt',
  'avaxusdt',
  'dotusdt',
];

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const subscribers = new Set<PriceCallback>();
let isShuttingDown = false;

const THROTTLE_MS = 250;
const pendingUpdates = new Map<
  string,
  {
    symbol: string;
    price: number;
    change24h: number;
    volume: number;
    high: number;
    low: number;
  }
>();
let throttleTimer: ReturnType<typeof setInterval> | null = null;

function flushPendingUpdates() {
  if (pendingUpdates.size === 0) return;
  for (const [, data] of pendingUpdates) {
    for (const cb of subscribers) {
      try {
        cb(data);
      } catch (err) {
        logger.warn({ err }, 'Subscriber callback error');
      }
    }
  }
  pendingUpdates.clear();
}

function startThrottle() {
  if (throttleTimer) return;
  throttleTimer = setInterval(flushPendingUpdates, THROTTLE_MS);
}

function stopThrottle() {
  if (throttleTimer) {
    clearInterval(throttleTimer);
    throttleTimer = null;
  }
  flushPendingUpdates();
}

export function getSubscribersCount(): number {
  return subscribers.size;
}

export function isBinanceConnected(): boolean {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}

export function subscribeBinance(cb: PriceCallback): () => void {
  subscribers.add(cb);
  if (subscribers.size === 1 && !ws) {
    connect();
  }
  startThrottle();
  return () => {
    subscribers.delete(cb);
    if (subscribers.size === 0) {
      stopThrottle();
      disconnect();
    }
  };
}

function parseTicker(msg: z.infer<typeof binanceTickerSchema>) {
  const data = {
    symbol: msg.s,
    price: parseFloat(msg.c),
    change24h: parseFloat(msg.P),
    volume: parseFloat(msg.q),
    high: parseFloat(msg.h),
    low: parseFloat(msg.l),
  };

  setCache(`ws_price:${msg.s}`, data);
  pendingUpdates.set(msg.s, data);
}

function connect() {
  if (isShuttingDown || ws) return;

  const streams = STREAM_SYMBOLS.map((s) => `${s}@ticker`).join('/');
  const url = `${config.BINANCE_WS_URL || 'wss://stream.binance.com:9443'}/ws/${streams}`;

  logger.info({ url: config.BINANCE_WS_URL }, 'Connecting to Binance WebSocket');

  try {
    ws = new WebSocket(url);
  } catch (err) {
    logger.error({ err }, 'Failed to create Binance WebSocket');
    scheduleReconnect();
    return;
  }

  ws.on('open', () => {
    reconnectAttempts = 0;
    logger.info('Binance WebSocket connected');
  });

  ws.on('message', (data: WebSocket.Data) => {
    try {
      const raw = JSON.parse(data.toString());
      const msg = binanceTickerSchema.parse(raw);
      parseTicker(msg);
    } catch (err) {
      if (err instanceof z.ZodError) {
        logger.warn({ err: err.message }, 'Received non-ticker Binance message');
      } else {
        logger.warn({ err }, 'Failed to parse Binance WebSocket message');
      }
    }
  });

  ws.on('error', (err: Error) => {
    logger.warn({ err: err.message }, 'Binance WebSocket error');
  });

  ws.on('close', (code: number, reason: Buffer) => {
    logger.info({ code, reason: reason.toString() }, 'Binance WebSocket closed');
    ws = null;
    if (!isShuttingDown && subscribers.size > 0) {
      scheduleReconnect();
    }
  });

  ws.on('unexpected-response', (_req: unknown, res: { statusCode: number }) => {
    logger.warn({ statusCode: res.statusCode }, 'Binance unexpected response');
    ws?.terminate();
    ws = null;
    scheduleReconnect();
  });
}

function scheduleReconnect() {
  if (reconnectTimer || isShuttingDown) return;

  reconnectAttempts++;
  if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
    logger.error({ attempts: reconnectAttempts }, 'Binance max reconnect attempts reached');
    return;
  }

  const baseDelay = Math.min(reconnectAttempts * 2000, 30000);
  const jitter = Math.random() * 3000;
  const delay = baseDelay + jitter;

  logger.info(
    { delay: Math.round(delay), attempt: reconnectAttempts },
    'Reconnecting Binance WebSocket in',
  );
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
}

function disconnect() {
  reconnectAttempts = 0;
  if (ws) {
    ws.removeAllListeners();
    ws.close();
    ws = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

export function shutdownBinance() {
  isShuttingDown = true;
  disconnect();
  logger.info('Binance WebSocket shut down');
}
