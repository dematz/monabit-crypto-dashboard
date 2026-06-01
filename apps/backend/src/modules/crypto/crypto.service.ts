import type { CryptoAsset, MarketOverview, PricePoint } from '@monabit/shared-types';
import { config } from '../../config/index.js';
import { getCached, setCache } from './crypto.cache.js';
import { fetchCoinGecko, setStaleCache, getStaleCache } from './coingecko-client.js';
import { mockTop10, mockMarketOverview, mockCoinHistory } from './coingecko.mock.js';
import { logger } from '../../shared/logger/index.js';
import { formatTimeLabel } from './date-labels.js';

async function fetchTop10(): Promise<CryptoAsset[]> {
  if (config.MOCK_CRYPTO) return mockTop10;
  const data = await fetchCoinGecko<CryptoAsset[]>(`${config.COINGECKO_API_URL}/coins/markets`, {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: 10,
    sparkline: true,
  });
  return data;
}

async function fetchMarketOverview(): Promise<MarketOverview> {
  if (config.MOCK_CRYPTO) return mockMarketOverview;
  const response = await fetchCoinGecko<{ data: MarketOverview }>(
    `${config.COINGECKO_API_URL}/global`,
  );
  return response.data;
}

function fetchedAt() {
  return new Date().toISOString();
}

export async function getTop10(): Promise<{
  data: CryptoAsset[];
  cached: boolean;
  stale?: boolean;
  fetched_at: string;
}> {
  const now = fetchedAt();
  const cached = getCached<CryptoAsset[]>('top10');
  if (cached) return { data: cached, cached: true, fetched_at: now };

  if (config.MOCK_CRYPTO) return { data: mockTop10, cached: true, fetched_at: now };

  try {
    const data = await fetchTop10();
    setCache('top10', data);
    setStaleCache('top10', data);
    return { data, cached: false, fetched_at: now };
  } catch (error) {
    logger.warn({ err: error }, 'CoinGecko top10 failed, trying stale cache');
    const stale = getStaleCache<CryptoAsset[]>('top10');
    if (stale) return { data: stale, cached: true, stale: true, fetched_at: now };
    throw error;
  }
}

export async function getMarketOverview(): Promise<{
  data: MarketOverview;
  cached: boolean;
  stale?: boolean;
  fetched_at: string;
}> {
  const now = fetchedAt();
  const cached = getCached<MarketOverview>('market_overview');
  if (cached) return { data: cached, cached: true, fetched_at: now };

  if (config.MOCK_CRYPTO) return { data: mockMarketOverview, cached: true, fetched_at: now };

  try {
    const data = await fetchMarketOverview();
    setCache('market_overview', data);
    setStaleCache('market_overview', data);
    return { data, cached: false, fetched_at: now };
  } catch (error) {
    logger.warn({ err: error }, 'CoinGecko market-overview failed, trying stale cache');
    const stale = getStaleCache<MarketOverview>('market_overview');
    if (stale) return { data: stale, cached: true, stale: true, fetched_at: now };
    throw error;
  }
}

export async function getCoinHistory(
  coinId: string,
  range: '1D' | '7D' | '1M' = '7D',
): Promise<{ data: PricePoint[]; cached: boolean; stale?: boolean; fetched_at: string }> {
  const now = fetchedAt();
  if (config.MOCK_CRYPTO) {
    return { data: mockCoinHistory(coinId, range), cached: true, fetched_at: now };
  }

  const cacheKey = `coin_history:${coinId}:${range}`;
  const cached = getCached<PricePoint[]>(cacheKey);
  if (cached) return { data: cached, cached: true, fetched_at: now };

  const days = range === '1D' ? 1 : range === '7D' ? 7 : 30;

  try {
    const raw = await fetchCoinGecko<{ prices: [number, number][] }>(
      `${config.COINGECKO_API_URL}/coins/${coinId}/market_chart`,
      { vs_currency: 'usd', days },
    );

    const points: PricePoint[] = raw.prices.map((point: [number, number]) => {
      const d = new Date(point[0]);
      return {
        t: formatTimeLabel(d, range),
        price: point[1],
      };
    });

    setCache(cacheKey, points);
    setStaleCache(cacheKey, points);
    return { data: points, cached: false, fetched_at: now };
  } catch (error) {
    logger.warn({ err: error, coinId, range }, 'CoinGecko coin-history failed, trying stale cache');
    const stale = getStaleCache<PricePoint[]>(cacheKey);
    if (stale) return { data: stale, cached: true, stale: true, fetched_at: now };
    throw error;
  }
}
