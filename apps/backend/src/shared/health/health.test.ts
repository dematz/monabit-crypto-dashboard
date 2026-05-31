import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { healthRoute } from './index.js';

vi.mock('../../lib/supabase.js', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      select: () => ({
        limit: () => ({
          abortSignal: () => Promise.resolve({ error: null }),
        }),
      }),
    }),
  }),
}));

vi.mock('../../config/index.js', () => ({
  config: {
    APP_VERSION: '0.1.0',
    MOCK_CRYPTO: true,
    COINGECKO_API_URL: 'https://api.coingecko.com/api/v3',
    SUPABASE_URL: 'https://test.supabase.co',
    LOG_LEVEL: 'silent',
    COINGECKO_API_KEY: '',
    BINANCE_WS_URL: 'wss://stream.binance.com:9443',
    SUPABASE_ANON_KEY: 'test',
    SUPABASE_SERVICE_ROLE_KEY: 'test',
    PORT: 0,
    ALLOWED_ORIGINS: '*',
    CACHE_TTL_TOP10: 60,
    CACHE_TTL_MARKET_OVERVIEW: 120,
    CACHE_TTL_COIN_HISTORY: 300,
    GROQ_API_KEY: '',
    GROQ_MODEL: 'test',
    GROQ_TIMEOUT: 30000,
  },
}));

vi.mock('../../modules/crypto/binance-ws.js', () => ({
  isBinanceConnected: () => false,
  getSubscribersCount: () => 0,
}));

vi.mock('../../shared/logger/index.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() },
}));

vi.mock('../../modules/auth/auth.middleware.js', () => ({
  authenticate: async (_req: any, _reply: any) => {},
}));

describe('GET /health', () => {
  async function buildApp() {
    const app = Fastify({ logger: false });
    await app.register(healthRoute);
    return app;
  }

  it('returns ok status with services', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('version', '0.1.0');
    expect(body.services).toHaveProperty('database');
    expect(body.services).toHaveProperty('coingecko');
    expect(body.services).toHaveProperty('binance_ws');
  });

  it('returns 404 for unknown routes', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/nonexistent' });
    expect(res.statusCode).toBe(404);
  });
});

describe('GET /health/deep', () => {
  async function buildApp() {
    const app = Fastify({ logger: false });
    await app.register(healthRoute);
    return app;
  }

  it('returns deep health with uptime and subscribers', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/health/deep',
      headers: { authorization: 'Bearer test-token' },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('uptime');
    expect(body.services).toHaveProperty('subscribers', 0);
  });
});
