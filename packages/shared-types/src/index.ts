export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  currency: string;
  refresh_interval: number;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  image: string;
}

export interface MarketOverview {
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_percentage: { btc: number; eth: number };
  market_cap_change_percentage_24h_usd: number;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  coin_id: string;
  coin_symbol: string;
  condition: 'above' | 'below';
  target_price: number;
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  cached: boolean;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  services: {
    database: 'ok' | 'error';
    coingecko: 'ok' | 'error';
    binance_ws: 'ok' | 'error';
  };
}
