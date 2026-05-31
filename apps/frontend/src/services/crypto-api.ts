import type { CryptoAsset, MarketOverview } from '@monabit/shared-types';
import { api } from './api';

interface ApiListResponse<T> {
  data: T[];
  cached: boolean;
}

interface ApiSingleResponse<T> {
  data: T;
  cached: boolean;
}

export function fetchTop10(): Promise<ApiListResponse<CryptoAsset>> {
  return api.get('/crypto/top10');
}

export function fetchMarketOverview(): Promise<ApiSingleResponse<MarketOverview>> {
  return api.get('/crypto/market-overview');
}

export function fetchCoinHistory(
  coinId: string,
  range: '1D' | '7D' | '1M',
): Promise<{ data: { t: string; price: number }[]; cached: boolean }> {
  return api.get(`/crypto/history/${coinId}?range=${range}`);
}
