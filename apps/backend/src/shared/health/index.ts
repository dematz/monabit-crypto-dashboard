import type { FastifyInstance } from 'fastify';
import { config } from '../../config/index.js';

export async function healthRoute(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok' as const,
    timestamp: new Date().toISOString(),
    version: config.APP_VERSION,
    services: {
      database: 'ok' as const,
      coingecko: 'ok' as const,
      binance_ws: 'ok' as const,
    },
  }));
}
