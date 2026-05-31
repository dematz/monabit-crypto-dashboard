import type { CryptoAsset, MarketOverview } from '@monabit/shared-types';

export const mockTop10: CryptoAsset[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 67420, market_cap: 1327000000000, total_volume: 28500000000, price_change_percentage_24h: 2.34, image: '' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3450, market_cap: 415000000000, total_volume: 18200000000, price_change_percentage_24h: 1.56, image: '' },
  { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.0, market_cap: 112000000000, total_volume: 52000000000, price_change_percentage_24h: 0.01, image: '' },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 578, market_cap: 89000000000, total_volume: 2100000000, price_change_percentage_24h: -0.87, image: '' },
  { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 142, market_cap: 64000000000, total_volume: 3800000000, price_change_percentage_24h: 5.21, image: '' },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.62, market_cap: 34000000000, total_volume: 1800000000, price_change_percentage_24h: -1.23, image: '' },
  { id: 'usd-coin', symbol: 'usdc', name: 'USDC', current_price: 1.0, market_cap: 33000000000, total_volume: 4800000000, price_change_percentage_24h: 0.01, image: '' },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.45, market_cap: 16000000000, total_volume: 650000000, price_change_percentage_24h: 3.12, image: '' },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.12, market_cap: 17000000000, total_volume: 1200000000, price_change_percentage_24h: -2.45, image: '' },
  { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 35.8, market_cap: 14000000000, total_volume: 520000000, price_change_percentage_24h: 4.78, image: '' },
];

export const mockMarketOverview: MarketOverview = {
  total_market_cap: { usd: 2450000000000 },
  total_volume: { usd: 95000000000 },
  market_cap_percentage: { btc: 54.2, eth: 17.8 },
  market_cap_change_percentage_24h_usd: 1.87,
};
