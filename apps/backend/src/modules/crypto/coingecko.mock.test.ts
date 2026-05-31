import { describe, it, expect } from 'vitest';
import { mockTop10, mockMarketOverview, mockCoinHistory } from './coingecko.mock';

describe('coingecko.mock', () => {
  it('mockTop10 returns 10 assets', () => {
    expect(mockTop10).toHaveLength(10);
    expect(mockTop10[0]).toHaveProperty('id');
    expect(mockTop10[0]).toHaveProperty('symbol');
    expect(mockTop10[0]).toHaveProperty('current_price');
  });

  it('mockMarketOverview has required fields', () => {
    expect(mockMarketOverview).toHaveProperty('total_market_cap');
    expect(mockMarketOverview).toHaveProperty('total_volume');
    expect(mockMarketOverview.total_market_cap).toHaveProperty('usd');
  });

  it('mockCoinHistory generates data for 1D range', () => {
    const result = mockCoinHistory('bitcoin', '1D');
    expect(result).toHaveLength(24);
    expect(result[0]).toHaveProperty('t');
    expect(result[0]).toHaveProperty('price');
  });

  it('mockCoinHistory generates data for 7D range', () => {
    const result = mockCoinHistory('ethereum', '7D');
    expect(result).toHaveLength(168);
  });

  it('mockCoinHistory generates data for 1M range', () => {
    const result = mockCoinHistory('solana', '1M');
    expect(result).toHaveLength(720);
  });
});
