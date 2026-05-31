import type { CryptoAsset, MarketOverview, PricePoint } from '@monabit/shared-types';

function sparklineSeed(base: number, vol: number, points: number, n: number): number[] {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < points; i++) {
    const r = Math.sin(i * 0.6 + n) + Math.cos(i * 0.27 + n * 1.7);
    v = Math.max(base * 0.6, v + r * vol);
    out.push(Number(v.toFixed(2)));
  }
  return out;
}

function seed(
  base: number,
  vol: number,
  points: number,
  n: number,
  range: '1D' | '7D' | '1M',
): PricePoint[] {
  const out: PricePoint[] = [];
  let v = base;
  const now = Date.now();
  const msPerPoint = range === '1D' ? 3600000 : 3600000;
  for (let i = 0; i < points; i++) {
    const r = Math.sin(i * 0.6 + n) + Math.cos(i * 0.27 + n * 1.7);
    v = Math.max(base * 0.6, v + r * vol);
    const d = new Date(now - (points - 1 - i) * msPerPoint);
    let label: string;
    if (range === '1D') {
      label = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (range === '7D') {
      label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    } else {
      label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    out.push({ t: label, price: Number(v.toFixed(2)) });
  }
  return out;
}

const HISTORY_SEED: Record<string, { base: number; vol: number }> = {
  bitcoin: { base: 67000, vol: 600 },
  ethereum: { base: 3500, vol: 40 },
  tether: { base: 1, vol: 0.002 },
  binancecoin: { base: 615, vol: 9 },
  solana: { base: 150, vol: 4 },
  ripple: { base: 0.52, vol: 0.012 },
  'usd-coin': { base: 1, vol: 0.001 },
  cardano: { base: 0.45, vol: 0.01 },
  dogecoin: { base: 0.155, vol: 0.004 },
  'avalanche-2': { base: 36, vol: 1.1 },
};

export function mockCoinHistory(coinId: string, range: '1D' | '7D' | '1M'): PricePoint[] {
  const s = HISTORY_SEED[coinId] ?? { base: 100, vol: 2 };
  const points = range === '1D' ? 24 : range === '7D' ? 168 : 720;
  const volMultiplier = range === '1D' ? 0.008 : range === '7D' ? 0.02 : 0.04;
  return seed(s.base, s.base * volMultiplier, points, s.base, range);
}

export const mockTop10: CryptoAsset[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 67420,
    market_cap: 1327000000000,
    total_volume: 28500000000,
    price_change_percentage_24h: 2.34,
    image: '',
    sparkline_in_7d: { price: sparklineSeed(67000, 600, 168, 1) },
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    current_price: 3450,
    market_cap: 415000000000,
    total_volume: 18200000000,
    price_change_percentage_24h: 1.56,
    image: '',
    sparkline_in_7d: { price: sparklineSeed(3500, 40, 168, 2) },
  },
  {
    id: 'tether',
    symbol: 'usdt',
    name: 'Tether',
    current_price: 1.0,
    market_cap: 112000000000,
    total_volume: 52000000000,
    price_change_percentage_24h: 0.01,
    image: '',
    sparkline_in_7d: { price: sparklineSeed(1, 0.002, 168, 3) },
  },
  {
    id: 'binancecoin',
    symbol: 'bnb',
    name: 'BNB',
    current_price: 578,
    market_cap: 89000000000,
    total_volume: 2100000000,
    price_change_percentage_24h: -0.87,
    image: '',
    sparkline_in_7d: { price: sparklineSeed(615, 9, 168, 4) },
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    current_price: 142,
    market_cap: 64000000000,
    total_volume: 3800000000,
    price_change_percentage_24h: 5.21,
    image: '',
    sparkline_in_7d: { price: sparklineSeed(150, 4, 168, 5) },
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    current_price: 0.62,
    market_cap: 34000000000,
    total_volume: 1800000000,
    price_change_percentage_24h: -1.23,
    image: '',
    sparkline_in_7d: { price: sparklineSeed(0.52, 0.012, 168, 7) },
  },
  {
    id: 'usd-coin',
    symbol: 'usdc',
    name: 'USDC',
    current_price: 1.0,
    market_cap: 33000000000,
    total_volume: 4800000000,
    price_change_percentage_24h: 0.01,
    image: '',
    sparkline_in_7d: { price: sparklineSeed(1, 0.001, 168, 6) },
  },
  {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    current_price: 0.45,
    market_cap: 16000000000,
    total_volume: 650000000,
    price_change_percentage_24h: 3.12,
    image: '',
    sparkline_in_7d: { price: sparklineSeed(0.45, 0.01, 168, 9) },
  },
  {
    id: 'dogecoin',
    symbol: 'doge',
    name: 'Dogecoin',
    current_price: 0.12,
    market_cap: 17000000000,
    total_volume: 1200000000,
    price_change_percentage_24h: -2.45,
    image: '',
    sparkline_in_7d: { price: sparklineSeed(0.155, 0.004, 168, 8) },
  },
  {
    id: 'avalanche-2',
    symbol: 'avax',
    name: 'Avalanche',
    current_price: 35.8,
    market_cap: 14000000000,
    total_volume: 520000000,
    price_change_percentage_24h: 4.78,
    image: '',
    sparkline_in_7d: { price: sparklineSeed(36, 1.1, 168, 10) },
  },
];

export const mockMarketOverview: MarketOverview = {
  total_market_cap: { usd: 2450000000000 },
  total_volume: { usd: 95000000000 },
  market_cap_percentage: { btc: 54.2, eth: 17.8 },
  market_cap_change_percentage_24h_usd: 1.87,
};
