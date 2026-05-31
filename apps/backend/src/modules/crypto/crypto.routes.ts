import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../auth/auth.middleware.js';
import { getTop10, getMarketOverview, getCoinHistory } from './crypto.service.js';

const coinHistoryParamsSchema = z.object({
  coinId: z.string().min(1),
});

const coinHistoryQuerySchema = z.object({
  range: z.enum(['1D', '7D', '1M']).default('7D'),
});

export async function cryptoModule(app: FastifyInstance) {
  app.get('/crypto/top10', { preHandler: [authenticate] }, async () => {
    return getTop10();
  });

  app.get('/crypto/market-overview', { preHandler: [authenticate] }, async () => {
    return getMarketOverview();
  });

  app.get('/crypto/history/:coinId', { preHandler: [authenticate] }, async (request) => {
    const { coinId } = coinHistoryParamsSchema.parse(request.params);
    const { range } = coinHistoryQuerySchema.parse(request.query);
    return getCoinHistory(coinId, range);
  });
}
