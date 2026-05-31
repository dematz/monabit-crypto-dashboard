import type { CryptoAsset, MarketOverview } from '@monabit/shared-types';
import { config } from '../../config/index.js';
import { getCached, setCache } from './crypto.cache.js';
import { mockTop10, mockMarketOverview } from './coingecko.mock.js';

async function fetchTop10(): Promise<CryptoAsset[]> {
  if (config.MOCK_CRYPTO) return mockTop10;
  const { default: axios } = await import('axios');
  const { data } = await axios.get<CryptoAsset[]>(
    `${config.SUPABASE_URL}/coins/markets`,
    { params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 10, sparkline: false } },
  );
  return data;
}

async function fetchMarketOverview(): Promise<MarketOverview> {
  if (config.MOCK_CRYPTO) return mockMarketOverview;
  const { default: axios } = await import('axios');
  const { data } = await axios.get<{ data: MarketOverview }>(
    `${config.SUPABASE_URL}/global`,
  );
  return data.data;
}

export async function getTop10(): Promise<{ data: CryptoAsset[]; cached: boolean }> {
  const cached = getCached<CryptoAsset[]>('top10');
  if (cached) return { data: cached, cached: true };
  const data = await fetchTop10();
  setCache('top10', data);
  return { data, cached: false };
}

export async function getMarketOverview(): Promise<{ data: MarketOverview; cached: boolean }> {
  const cached = getCached<MarketOverview>('market_overview');
  if (cached) return { data: cached, cached: true };
  const data = await fetchMarketOverview();
  setCache('market_overview', data);
  return { data, cached: false };
}
