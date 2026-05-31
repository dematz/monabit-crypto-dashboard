import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/index.js', () => ({
  config: {
    MOCK_CRYPTO: true,
    COINGECKO_API_KEY: '',
    COINGECKO_API_URL: 'https://api.coingecko.com/api/v3',
    CACHE_TTL_TOP10: 60,
    CACHE_TTL_MARKET_OVERVIEW: 120,
    CACHE_TTL_COIN_HISTORY: 300,
  },
}));

vi.mock('../../shared/logger/index.js', () => ({
  logger: { warn: vi.fn(), info: vi.fn() },
}));

vi.mock('./crypto.cache.js', () => {
  const store = new Map<string, { data: unknown; ttl: number }>();
  return {
    getCached: vi.fn((key: string) => store.get(key)?.data ?? null),
    setCache: vi.fn((key: string, data: unknown) => {
      store.set(key, { data, ttl: Date.now() + 60000 });
    }),
    clearCache: vi.fn(() => store.clear()),
  };
});

vi.mock('./coingecko-client.js', () => ({
  fetchCoinGecko: vi.fn(),
  setStaleCache: vi.fn(),
  getStaleCache: vi.fn().mockReturnValue(null),
}));

import { getTop10, getMarketOverview, getCoinHistory } from './crypto.service.js';

describe('crypto.service (MOCK_CRYPTO=true)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getTop10 returns mock data', async () => {
    const result = await getTop10();
    expect(result.data).toHaveLength(10);
    expect(result).toHaveProperty('cached', true);
  });

  it('getMarketOverview returns mock data', async () => {
    const result = await getMarketOverview();
    expect(result.data).toHaveProperty('total_market_cap');
    expect(result).toHaveProperty('cached', true);
  });

  it('getCoinHistory returns mock data for 1D', async () => {
    const result = await getCoinHistory('bitcoin', '1D');
    expect(result.data).toHaveLength(24);
    expect(result.data[0]).toHaveProperty('t');
    expect(result.data[0]).toHaveProperty('price');
  });

  it('getCoinHistory returns mock data for 7D', async () => {
    const result = await getCoinHistory('ethereum', '7D');
    expect(result.data).toHaveLength(168);
  });

  it('getCoinHistory returns mock data for 1M', async () => {
    const result = await getCoinHistory('solana', '1M');
    expect(result.data).toHaveLength(720);
  });
});
