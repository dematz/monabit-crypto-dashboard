import { describe, it, expect } from 'vitest';
import {
  cryptoAssetSchema,
  marketOverviewSchema,
  wsPriceUpdateSchema,
  authMeResponseSchema,
  ollamaResponseSchema,
  userProfileSchema,
  favoriteSchema,
} from './schemas';

const validAsset = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  current_price: 73994,
  market_cap: 1.46e12,
  total_volume: 3.5e10,
  price_change_percentage_24h: 0.55,
  image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png',
};

describe('cryptoAssetSchema', () => {
  it('validates a valid asset', () => {
    expect(cryptoAssetSchema.safeParse(validAsset).success).toBe(true);
  });

  it('validates asset with optional sparkline', () => {
    const withSparkline = { ...validAsset, sparkline_in_7d: { price: [73000, 73500, 73994] } };
    expect(cryptoAssetSchema.safeParse(withSparkline).success).toBe(true);
  });

  it('rejects missing required fields', () => {
    expect(cryptoAssetSchema.safeParse({}).success).toBe(false);
  });

  it('rejects wrong types', () => {
    expect(
      cryptoAssetSchema.safeParse({ ...validAsset, current_price: 'not-a-number' }).success,
    ).toBe(false);
  });
});

describe('marketOverviewSchema', () => {
  const validOverview = {
    total_market_cap: { usd: 2.57e12 },
    total_volume: { usd: 8.5e10 },
    market_cap_percentage: { btc: 57.4, eth: 9.5 },
    market_cap_change_percentage_24h_usd: 1.2,
  };

  it('validates valid market overview', () => {
    expect(marketOverviewSchema.safeParse(validOverview).success).toBe(true);
  });

  it('rejects missing fields', () => {
    expect(marketOverviewSchema.safeParse({}).success).toBe(false);
  });
});

describe('wsPriceUpdateSchema', () => {
  const validUpdate = {
    symbol: 'BTCUSDT',
    price: 73994.5,
    change24h: 0.55,
    volume: 3.5e10,
    high: 74200,
    low: 73500,
  };

  it('validates a valid price update', () => {
    expect(wsPriceUpdateSchema.safeParse(validUpdate).success).toBe(true);
  });

  it('rejects empty symbol', () => {
    expect(wsPriceUpdateSchema.safeParse({ ...validUpdate, symbol: '' }).success).toBe(false);
  });

  it('rejects missing volume', () => {
    expect(
      wsPriceUpdateSchema.safeParse({
        symbol: 'BTCUSDT',
        price: 73994.5,
        change24h: 0.55,
        high: 74200,
        low: 73500,
      }).success,
    ).toBe(false);
  });
});

describe('authMeResponseSchema', () => {
  const validResponse = {
    user: { id: 'abc', email: 'test@test.com', role: 'admin' },
    profile: { display_name: 'Admin' },
  };

  it('validates auth response with profile', () => {
    expect(authMeResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it('validates auth response with null profile', () => {
    expect(authMeResponseSchema.safeParse({ ...validResponse, profile: null }).success).toBe(true);
  });

  it('rejects invalid role', () => {
    expect(
      authMeResponseSchema.safeParse({
        ...validResponse,
        user: { ...validResponse.user, role: 'superadmin' },
      }).success,
    ).toBe(false);
  });
});

describe('ollamaResponseSchema', () => {
  it('validates response under 5000 chars', () => {
    expect(ollamaResponseSchema.safeParse({ question: 'hi', answer: 'Hello' }).success).toBe(true);
  });

  it('rejects answer over 5000 chars', () => {
    expect(
      ollamaResponseSchema.safeParse({ question: 'hi', answer: 'a'.repeat(5001) }).success,
    ).toBe(false);
  });
});

describe('userProfileSchema', () => {
  const valid = {
    id: 'abc',
    email: 'test@test.com',
    display_name: 'Test',
    avatar_url: null,
    role: 'user',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  it('validates a complete profile', () => {
    expect(userProfileSchema.safeParse(valid).success).toBe(true);
  });

  it('validates profile with null email', () => {
    expect(userProfileSchema.safeParse({ ...valid, email: null }).success).toBe(true);
  });

  it('rejects missing role', () => {
    expect(
      userProfileSchema.safeParse({
        id: 'abc',
        email: 'test@test.com',
        display_name: 'Test',
        avatar_url: null,
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      }).success,
    ).toBe(false);
  });
});

describe('favoriteSchema', () => {
  const valid = {
    id: 'fav-1',
    user_id: 'user-1',
    coin_id: 'bitcoin',
    coin_symbol: 'btc',
    added_at: '2026-01-01T00:00:00Z',
  };

  it('validates a valid favorite', () => {
    expect(favoriteSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects missing coin_id', () => {
    expect(
      favoriteSchema.safeParse({
        id: 'fav-1',
        user_id: 'user-1',
        coin_symbol: 'btc',
        added_at: '2026-01-01T00:00:00Z',
      }).success,
    ).toBe(false);
  });
});
