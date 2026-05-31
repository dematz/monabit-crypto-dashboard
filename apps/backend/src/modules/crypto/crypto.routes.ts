import type { FastifyInstance } from 'fastify';
import { authenticate } from '../auth/auth.middleware.js';
import { getTop10, getMarketOverview } from './crypto.service.js';

export async function cryptoModule(app: FastifyInstance) {
  app.get('/crypto/top10', { preHandler: [authenticate] }, async () => {
    return getTop10();
  });

  app.get('/crypto/market-overview', { preHandler: [authenticate] }, async () => {
    return getMarketOverview();
  });
}
