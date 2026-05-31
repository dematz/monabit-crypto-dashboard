import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { cryptoModule } from './crypto.routes.js';

vi.mock('./crypto.service.js', () => ({
  getTop10: vi.fn().mockResolvedValue({
    data: [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 73994,
        market_cap: 1.46e12,
        total_volume: 3.5e10,
        price_change_percentage_24h: 0.55,
        image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png',
        sparkline_in_7d: { price: [73000, 73500, 73994] },
      },
    ],
    cached: false,
  }),
  getMarketOverview: vi.fn().mockResolvedValue({
    data: {
      total_market_cap: { usd: 2.57e12 },
      total_volume: { usd: 8.5e10 },
      market_cap_percentage: { btc: 57.4, eth: 9.5 },
      market_cap_change_percentage_24h_usd: 1.2,
    },
    cached: false,
  }),
  getCoinHistory: vi.fn().mockResolvedValue({
    data: [
      { t: 'Mon 15', price: 73994 },
      { t: 'Tue 16', price: 74100 },
    ],
    cached: false,
  }),
}));

vi.mock('../../config/index.js', () => ({
  config: {
    MOCK_CRYPTO: false,
    LOG_LEVEL: 'silent',
    PORT: 0,
    APP_VERSION: 'test',
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test',
    SUPABASE_SERVICE_ROLE_KEY: 'test',
    COINGECKO_API_URL: 'https://api.coingecko.com/api/v3',
    COINGECKO_API_KEY: '',
    ALLOWED_ORIGINS: '*',
    CACHE_TTL_TOP10: 60,
    CACHE_TTL_MARKET_OVERVIEW: 120,
    CACHE_TTL_COIN_HISTORY: 300,
    GROQ_API_KEY: '',
    GROQ_MODEL: 'test',
    GROQ_TIMEOUT: 30000,
    BINANCE_WS_URL: 'wss://stream.binance.com:9443',
  },
}));

vi.mock('../../shared/logger/index.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() },
}));

vi.mock('../auth/auth.middleware.js', () => ({
  authenticate: async (_req: any, _reply: any) => {},
  requireAdmin: async (_req: any, _reply: any) => {},
}));

const mockUser = { id: 'test-user', email: 'test@test.com', role: 'user' as const };

describe('cryptoModule', () => {
  async function buildApp() {
    const app = Fastify({ logger: false });
    app.addHook('onRequest', async (req, reply) => {
      if (!req.headers.authorization) {
        return reply.status(401).send({ error: 'Missing or invalid authorization header' });
      }
      req.user = mockUser;
    });
    await app.register(cryptoModule);
    return app;
  }

  it('GET /crypto/top10 returns data', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/crypto/top10',
      headers: { authorization: 'Bearer token' },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('data');
    expect(body.data[0]).toHaveProperty('id', 'bitcoin');
    expect(body).toHaveProperty('cached', false);
  });

  it('GET /crypto/top10 returns 401 without auth', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/crypto/top10' });
    expect(res.statusCode).toBe(401);
  });

  it('GET /crypto/market-overview returns market data', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/crypto/market-overview',
      headers: { authorization: 'Bearer token' },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data).toHaveProperty('total_market_cap');
  });

  it('GET /crypto/market-overview returns 401 without auth', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/crypto/market-overview' });
    expect(res.statusCode).toBe(401);
  });

  it('GET /crypto/history/:coinId returns price history', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/crypto/history/bitcoin',
      headers: { authorization: 'Bearer token' },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data).toHaveLength(2);
  });

  it('returns 404 for unknown routes', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/nonexistent',
      headers: { authorization: 'Bearer token' },
    });
    expect(res.statusCode).toBe(404);
  });
});
