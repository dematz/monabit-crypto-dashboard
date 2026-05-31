import type { CryptoAsset, MarketOverview, PricePoint } from '@monabit/shared-types';
import { config } from '../../config/index.js';
import { getCached, setCache } from './crypto.cache.js';
import { mockTop10, mockMarketOverview, mockCoinHistory } from './coingecko.mock.js';

async function fetchTop10(): Promise<CryptoAsset[]> {
  if (config.MOCK_CRYPTO) return mockTop10;
  const { default: axios } = await import('axios');
  const { data } = await axios.get<CryptoAsset[]>(`${config.COINGECKO_API_URL}/coins/markets`, {
    params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 10, sparkline: false },
  });
  return data;
}

async function fetchMarketOverview(): Promise<MarketOverview> {
  if (config.MOCK_CRYPTO) return mockMarketOverview;
  const { default: axios } = await import('axios');
  const { data } = await axios.get<{ data: MarketOverview }>(`${config.COINGECKO_API_URL}/global`);
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

export async function getCoinHistory(
  coinId: string,
  range: '1D' | '7D' | '1M' = '7D',
): Promise<{ data: PricePoint[]; cached: boolean }> {
  if (config.MOCK_CRYPTO) {
    return { data: mockCoinHistory(coinId, range), cached: true };
  }
  const cacheKey = `coin_history:${coinId}:${range}`;
  const cached = getCached<PricePoint[]>(cacheKey);
  if (cached) return { data: cached, cached: true };
  const { default: axios } = await import('axios');
  const days = range === '1D' ? 1 : range === '7D' ? 7 : 30;
  const { data } = await axios.get<{ prices: [number, number][] }>(
    `${config.COINGECKO_API_URL}/coins/${coinId}/market_chart`,
    { params: { vs_currency: 'usd', days } },
  );
  const points: PricePoint[] = data.prices.map(([ts, price]) => {
    const d = new Date(ts);
    if (range === '1D') {
      return {
        t: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        price,
      };
    }
    if (range === '7D') {
      return { t: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }), price };
    }
    return { t: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), price };
  });
  setCache(cacheKey, points);
  return { data: points, cached: false };
}
