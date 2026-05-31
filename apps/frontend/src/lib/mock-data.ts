import type { DisplayCryptoAsset, PricePoint, UserRow } from '@/types';

const seed = (n: number, base: number, vol: number, points: number) => {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < points; i++) {
    const r = Math.sin(i * 0.6 + n) + Math.cos(i * 0.27 + n * 1.7);
    v = Math.max(base * 0.6, v + r * vol);
    out.push(Number(v.toFixed(2)));
  }
  return out;
};

export const CRYPTO_ASSETS: DisplayCryptoAsset[] = [
  {
    id: 'bitcoin',
    rank: 1,
    name: 'Bitcoin',
    symbol: 'BTC',
    logo: '₿',
    price: 67_842.31,
    change24h: 2.43,
    marketCap: 1_338_200_000_000,
    volume24h: 28_400_000_000,
    sparkline: seed(1, 67000, 600, 40),
  },
  {
    id: 'ethereum',
    rank: 2,
    name: 'Ethereum',
    symbol: 'ETH',
    logo: 'Ξ',
    price: 3_521.7,
    change24h: 1.18,
    marketCap: 423_100_000_000,
    volume24h: 14_900_000_000,
    sparkline: seed(2, 3500, 40, 40),
  },
  {
    id: 'tether',
    rank: 3,
    name: 'Tether',
    symbol: 'USDT',
    logo: '₮',
    price: 1.0,
    change24h: 0.01,
    marketCap: 112_300_000_000,
    volume24h: 42_100_000_000,
    sparkline: seed(3, 1, 0.002, 40),
  },
  {
    id: 'binancecoin',
    rank: 4,
    name: 'BNB',
    symbol: 'BNB',
    logo: '◆',
    price: 612.45,
    change24h: -0.92,
    marketCap: 91_800_000_000,
    volume24h: 1_900_000_000,
    sparkline: seed(4, 615, 9, 40),
  },
  {
    id: 'solana',
    rank: 5,
    name: 'Solana',
    symbol: 'SOL',
    logo: '◎',
    price: 154.21,
    change24h: 4.76,
    marketCap: 71_200_000_000,
    volume24h: 3_400_000_000,
    sparkline: seed(5, 150, 4, 40),
  },
  {
    id: 'usdc',
    rank: 6,
    name: 'USD Coin',
    symbol: 'USDC',
    logo: 'Ⓤ',
    price: 1.0,
    change24h: 0,
    marketCap: 33_900_000_000,
    volume24h: 6_700_000_000,
    sparkline: seed(6, 1, 0.001, 40),
  },
  {
    id: 'xrp',
    rank: 7,
    name: 'XRP',
    symbol: 'XRP',
    logo: '✕',
    price: 0.5234,
    change24h: -1.42,
    marketCap: 29_100_000_000,
    volume24h: 1_200_000_000,
    sparkline: seed(7, 0.52, 0.012, 40),
  },
  {
    id: 'dogecoin',
    rank: 8,
    name: 'Dogecoin',
    symbol: 'DOGE',
    logo: 'Ð',
    price: 0.1583,
    change24h: 3.27,
    marketCap: 22_700_000_000,
    volume24h: 1_100_000_000,
    sparkline: seed(8, 0.155, 0.004, 40),
  },
  {
    id: 'cardano',
    rank: 9,
    name: 'Cardano',
    symbol: 'ADA',
    logo: '₳',
    price: 0.4421,
    change24h: -2.11,
    marketCap: 15_800_000_000,
    volume24h: 410_000_000,
    sparkline: seed(9, 0.45, 0.01, 40),
  },
  {
    id: 'avalanche',
    rank: 10,
    name: 'Avalanche',
    symbol: 'AVAX',
    logo: '▲',
    price: 36.91,
    change24h: 5.62,
    marketCap: 14_300_000_000,
    volume24h: 520_000_000,
    sparkline: seed(10, 36, 1.1, 40),
  },
];

export const MARKET_KPIS = {
  marketCap: 2_412_000_000_000,
  marketCapChange: 1.84,
  volume24h: 98_700_000_000,
  volumeChange: -3.21,
  btcDominance: 55.42,
  btcDominanceChange: 0.31,
  marketCapSpark: seed(11, 2400, 12, 30),
  volumeSpark: seed(12, 95, 2.4, 30),
  dominanceSpark: seed(13, 55, 0.4, 30),
};

export const buildPriceHistory = (assetId: string, range: '1D' | '7D' | '1M'): PricePoint[] => {
  const asset = CRYPTO_ASSETS.find((a) => a.id === assetId) ?? CRYPTO_ASSETS[0]!;
  const points = range === '1D' ? 24 : range === '7D' ? 28 : 30;
  const vol = asset.price * (range === '1D' ? 0.005 : range === '7D' ? 0.02 : 0.05);
  const series = seed(asset.rank * 7, asset.price, vol, points);
  return series.map((price, i) => {
    const label =
      range === '1D'
        ? `${String(i).padStart(2, '0')}:00`
        : range === '7D'
          ? `D${i + 1}`
          : `${i + 1}`;
    return { t: label, price };
  });
};

export const MOCK_USERS: UserRow[] = [
  {
    id: 'u_01',
    name: 'María González',
    email: 'maria@monabit.io',
    role: 'Admin',
    status: 'Activo',
    createdAt: '2024-02-11',
  },
  {
    id: 'u_02',
    name: 'Carlos Pérez',
    email: 'carlos@monabit.io',
    role: 'User',
    status: 'Activo',
    createdAt: '2024-04-03',
  },
  {
    id: 'u_03',
    name: 'Lucía Fernández',
    email: 'lucia@monabit.io',
    role: 'User',
    status: 'Inactivo',
    createdAt: '2024-05-21',
  },
  {
    id: 'u_04',
    name: 'Diego Ramírez',
    email: 'diego@monabit.io',
    role: 'Admin',
    status: 'Activo',
    createdAt: '2024-06-09',
  },
  {
    id: 'u_05',
    name: 'Ana Torres',
    email: 'ana@monabit.io',
    role: 'User',
    status: 'Activo',
    createdAt: '2024-07-15',
  },
  {
    id: 'u_06',
    name: 'Javier López',
    email: 'javier@monabit.io',
    role: 'User',
    status: 'Inactivo',
    createdAt: '2024-08-02',
  },
];
