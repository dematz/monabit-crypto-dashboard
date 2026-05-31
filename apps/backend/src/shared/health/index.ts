import type { FastifyInstance } from 'fastify';
import { config } from '../../config/index.js';
import { isBinanceConnected, getSubscribersCount } from '../../modules/crypto/binance-ws.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { fetchCoinGecko } from '../../modules/crypto/coingecko-client.js';
import { authenticate } from '../../modules/auth/auth.middleware.js';

type ServiceStatus = 'ok' | 'degraded' | 'error';

async function checkDatabase(): Promise<ServiceStatus> {
  try {
    const { error } = await getSupabaseAdmin()
      .from('user_profiles')
      .select('id')
      .limit(1)
      .abortSignal(AbortSignal.timeout(2000));
    return error ? 'error' : 'ok';
  } catch {
    return 'error';
  }
}

async function checkCoinGecko(): Promise<ServiceStatus> {
  if (config.MOCK_CRYPTO) return 'ok';
  try {
    await fetchCoinGecko<{ data: { data: { active_cryptocurrencies: number } } }>(
      `${config.COINGECKO_API_URL}/global`,
      {},
    );
    return 'ok';
  } catch {
    return 'degraded';
  }
}

export async function healthRoute(app: FastifyInstance) {
  app.get('/health', async () => {
    const [database, coingecko] = await Promise.all([checkDatabase(), checkCoinGecko()]);

    const status: ServiceStatus =
      database === 'error' || coingecko === 'error'
        ? 'error'
        : database === 'degraded' || coingecko === 'degraded'
          ? 'degraded'
          : 'ok';

    return {
      status,
      timestamp: new Date().toISOString(),
      version: config.APP_VERSION,
      services: {
        database,
        coingecko,
        binance_ws: isBinanceConnected() ? ('ok' as const) : ('disconnected' as const),
      },
    };
  });

  app.get('/health/deep', { preHandler: [authenticate] }, async () => {
    const [database, coingecko] = await Promise.all([checkDatabase(), checkCoinGecko()]);

    const status: ServiceStatus =
      database === 'error' || coingecko === 'error'
        ? 'error'
        : database === 'degraded' || coingecko === 'degraded'
          ? 'degraded'
          : 'ok';

    return {
      status,
      timestamp: new Date().toISOString(),
      version: config.APP_VERSION,
      uptime: process.uptime(),
      services: {
        database,
        coingecko,
        binance_ws: isBinanceConnected() ? ('ok' as const) : ('disconnected' as const),
        subscribers: getSubscribersCount(),
      },
    };
  });
}
