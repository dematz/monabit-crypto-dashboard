import { config } from '../../config/index.js';
import { logger } from '../../shared/logger/index.js';

type CacheEntry<T> = { data: T; timestamp: number };
const staleStore = new Map<string, CacheEntry<unknown>>();
const MAX_STALE_MS = 5 * 60 * 1000;

let consecutiveFailures = 0;
let circuitOpenUntil = 0;

function coingeckoHeaders(): Record<string, string> {
  return config.COINGECKO_API_KEY ? { 'x-cg-demo-api-key': config.COINGECKO_API_KEY } : {};
}

function isCircuitOpen(): boolean {
  if (consecutiveFailures < 3) return false;
  if (Date.now() > circuitOpenUntil) {
    logger.info('CoinGecko circuit breaker: half-open, attempting recovery');
    return false;
  }
  return true;
}

function recordSuccess(): void {
  consecutiveFailures = 0;
}

function recordFailure(): void {
  consecutiveFailures++;
  if (consecutiveFailures >= 3) {
    circuitOpenUntil = Date.now() + 5 * 60 * 1000;
    logger.warn({ failures: consecutiveFailures }, 'CoinGecko circuit breaker: open for 5 minutes');
  }
}

async function requestWithRetry<T>(url: string, params: Record<string, unknown>): Promise<T> {
  const { default: axios } = await import('axios');

  for (let attempt = 0; attempt <= 1; attempt++) {
    try {
      const { data } = await axios.get<T>(url, {
        params,
        headers: coingeckoHeaders(),
        timeout: 10000,
        validateStatus: (status) => status < 500,
      });
      recordSuccess();
      return data;
    } catch (error) {
      const isRetryable =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as { response?: { status?: number } }).response?.status === 429;

      if (isRetryable && attempt === 0) {
        logger.warn('CoinGecko rate limited (429), retrying in 2s');
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }

      const status =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as { response?: { status?: number } }).response?.status;

      if (status === 429) {
        recordFailure();
        throw new Error('CoinGecko rate limit exceeded (429)');
      }

      throw error;
    }
  }

  throw new Error('CoinGecko request failed after retry');
}

export async function fetchCoinGecko<T>(
  url: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  if (isCircuitOpen()) {
    throw new Error('CoinGecko circuit breaker is open');
  }

  try {
    const data = await requestWithRetry<T>(url, params);
    return data;
  } catch (error) {
    recordFailure();
    throw error;
  }
}

export function setStaleCache<T>(key: string, data: T): void {
  staleStore.set(key, { data, timestamp: Date.now() });
}

export function getStaleCache<T>(key: string): T | undefined {
  const entry = staleStore.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > MAX_STALE_MS) {
    staleStore.delete(key);
    return undefined;
  }
  return entry.data;
}

export { coingeckoHeaders };
