export type CryptoAsset = {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
};

export type PricePoint = { t: string; price: number };

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  status: 'Activo' | 'Inactivo';
  createdAt: string;
};

export type PriceAlert = {
  id: string;
  assetId: string;
  condition: 'above' | 'below';
  target: number;
  createdAt: string;
};

export type Theme = 'light' | 'dark' | 'system';
export type Currency = 'USD' | 'EUR';

export type SessionUser = {
  name: string;
  email: string;
  role: 'Admin' | 'User';
} | null;