import WebSocket from 'ws';
import { logger } from '../../shared/logger/index.js';
import { config } from '../../config/index.js';
import { setCache } from './crypto.cache.js';

interface BinanceTicker {
  e: string;
  E: number;
  s: string;
  p: string;
  P: string;
  c: string;
  v: string;
  q: string;
  h: string;
  l: string;
  n: string;
}

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
const subscribers = new Set<PriceCallback>();
let isShuttingDown = false;

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
  return () => {
    subscribers.delete(cb);
    if (subscribers.size === 0) {
      disconnect();
    }
  };
}

function parseTicker(msg: BinanceTicker) {
  const data = {
    symbol: msg.s,
    price: parseFloat(msg.c),
    change24h: parseFloat(msg.P),
    volume: parseFloat(msg.q),
    high: parseFloat(msg.h),
    low: parseFloat(msg.l),
  };

  setCache(`ws_price:${msg.s}`, data);

  for (const cb of subscribers) {
    try {
      cb(data);
    } catch {}
  }
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
    logger.info('Binance WebSocket connected');
  });

  ws.on('message', (data: WebSocket.Data) => {
    try {
      const msg = JSON.parse(data.toString()) as BinanceTicker;
      if (msg.e === '24hrTicker') {
        parseTicker(msg);
      }
    } catch {}
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
  const delay = 5000 + Math.random() * 5000;
  logger.info({ delay: Math.round(delay) }, 'Reconnecting Binance WebSocket in');
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
}

function disconnect() {
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
