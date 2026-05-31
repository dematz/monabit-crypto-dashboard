import { describe, it, expect } from 'vitest';
import { addFavoriteSchema, createAlertSchema } from './alerts-favorites.schema';

describe('addFavoriteSchema', () => {
  it('validates correct input', () => {
    const result = addFavoriteSchema.safeParse({ coin_id: 'bitcoin', coin_symbol: 'BTC' });
    expect(result.success).toBe(true);
  });

  it('rejects empty coin_id', () => {
    const result = addFavoriteSchema.safeParse({ coin_id: '', coin_symbol: 'BTC' });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = addFavoriteSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('createAlertSchema', () => {
  it('validates correct input', () => {
    const result = createAlertSchema.safeParse({
      coin_id: 'bitcoin',
      coin_symbol: 'BTC',
      condition: 'above',
      target_price: 100000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid condition', () => {
    const result = createAlertSchema.safeParse({
      coin_id: 'bitcoin',
      coin_symbol: 'BTC',
      condition: 'invalid',
      target_price: 100000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero target_price', () => {
    const result = createAlertSchema.safeParse({
      coin_id: 'bitcoin',
      coin_symbol: 'BTC',
      condition: 'above',
      target_price: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative target_price', () => {
    const result = createAlertSchema.safeParse({
      coin_id: 'bitcoin',
      coin_symbol: 'BTC',
      condition: 'below',
      target_price: -5,
    });
    expect(result.success).toBe(false);
  });
});
