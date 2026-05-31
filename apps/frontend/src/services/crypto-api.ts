import { api } from './api';
import { cryptoAssetSchema, marketOverviewSchema, coinHistoryPointSchema } from '../lib/schemas';
import { z } from 'zod';

const apiListResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({ data: z.array(itemSchema), cached: z.boolean(), fetched_at: z.string() });

const apiSingleResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({ data: itemSchema, cached: z.boolean(), fetched_at: z.string() });

export function fetchTop10() {
  return api
    .get('/crypto/top10')
    .then((data) => apiListResponseSchema(cryptoAssetSchema).parse(data));
}

export function fetchMarketOverview() {
  return api
    .get('/crypto/market-overview')
    .then((data) => apiSingleResponseSchema(marketOverviewSchema).parse(data));
}

export function fetchCoinHistory(coinId: string, range: '1D' | '7D' | '1M') {
  return api
    .get(`/crypto/history/${coinId}?range=${range}`)
    .then((data) => apiSingleResponseSchema(z.array(coinHistoryPointSchema)).parse(data));
}
