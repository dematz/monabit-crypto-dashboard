import { describe, it, expect } from 'vitest';
import { toDisplayAsset } from '@/types';

describe('toDisplayAsset', () => {
  const btcApi = {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 67420,
    market_cap: 1327000000000,
    total_volume: 28500000000,
    price_change_percentage_24h: 2.34,
    image: '',
  };

  it('maps id correctly', () => {
    const result = toDisplayAsset(btcApi, 0);
    expect(result.id).toBe('bitcoin');
  });

  it('calculates rank from index (1-based)', () => {
    expect(toDisplayAsset(btcApi, 0).rank).toBe(1);
    expect(toDisplayAsset(btcApi, 4).rank).toBe(5);
  });

  it('uppercases symbol', () => {
    expect(toDisplayAsset(btcApi, 0).symbol).toBe('BTC');
  });

  it('uses image when provided, falls back to first letter', () => {
    const withImage = toDisplayAsset({ ...btcApi, image: 'https://example.com/btc.png' }, 0);
    expect(withImage.logo).toBe('https://example.com/btc.png');

    const noImage = toDisplayAsset({ ...btcApi, image: '' }, 0);
    expect(noImage.logo).toBe('B');
  });

  it('maps price, change, marketCap, volume correctly', () => {
    const result = toDisplayAsset(btcApi, 0);
    expect(result.price).toBe(67420);
    expect(result.change24h).toBe(2.34);
    expect(result.marketCap).toBe(1327000000000);
    expect(result.volume24h).toBe(28500000000);
  });

  it('generates sparkline array of 40 values', () => {
    const result = toDisplayAsset(btcApi, 0);
    expect(result.sparkline).toHaveLength(40);
  });

  it('generates different sparklines for different indices', () => {
    const a = toDisplayAsset(btcApi, 0);
    const b = toDisplayAsset(btcApi, 1);
    expect(a.sparkline).not.toEqual(b.sparkline);
  });
});
