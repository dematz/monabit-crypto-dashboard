import NodeCache from 'node-cache';
import { config } from '../../config/index.js';

const cache = new NodeCache({ checkperiod: 30 });

export function getCached<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCache<T>(key: string, value: T): void {
  const ttlMap: Record<string, number> = {
    top10: config.CACHE_TTL_TOP10,
    market_overview: config.CACHE_TTL_MARKET_OVERVIEW,
    coin_history: config.CACHE_TTL_COIN_HISTORY,
  };
  const ttl = ttlMap[key] ?? 60;
  cache.set(key, value, ttl);
}
