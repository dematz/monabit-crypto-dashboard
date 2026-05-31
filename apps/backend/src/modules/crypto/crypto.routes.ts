import type { FastifyInstance } from 'fastify';
import { authenticate } from '../auth/auth.middleware.js';
import { getTop10, getMarketOverview, getCoinHistory } from './crypto.service.js';

export async function cryptoModule(app: FastifyInstance) {
  app.get('/crypto/top10', { preHandler: [authenticate] }, async () => {
    return getTop10();
  });

  app.get('/crypto/market-overview', { preHandler: [authenticate] }, async () => {
    return getMarketOverview();
  });

  app.get('/crypto/history/:coinId', { preHandler: [authenticate] }, async (request) => {
    const { coinId } = request.params as { coinId: string };
    const { range } = request.query as { range?: '1D' | '7D' | '1M' };
    return getCoinHistory(coinId, range ?? '7D');
  });
}
