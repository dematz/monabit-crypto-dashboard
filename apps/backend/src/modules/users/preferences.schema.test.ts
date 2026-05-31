import { describe, it, expect } from 'vitest';
import { updatePreferencesSchema } from './preferences.schema';

describe('updatePreferencesSchema', () => {
  it('validates theme update', () => {
    expect(updatePreferencesSchema.safeParse({ theme: 'dark' }).success).toBe(true);
  });

  it('validates currency update', () => {
    expect(updatePreferencesSchema.safeParse({ currency: 'EUR' }).success).toBe(true);
  });

  it('validates refresh_interval update', () => {
    expect(updatePreferencesSchema.safeParse({ refresh_interval: 30 }).success).toBe(true);
  });

  it('rejects invalid theme', () => {
    expect(updatePreferencesSchema.safeParse({ theme: 'neon' }).success).toBe(false);
  });

  it('rejects invalid currency', () => {
    expect(updatePreferencesSchema.safeParse({ currency: 'GBP' }).success).toBe(false);
  });

  it('rejects refresh_interval below 5', () => {
    expect(updatePreferencesSchema.safeParse({ refresh_interval: 4 }).success).toBe(false);
  });

  it('rejects refresh_interval above 300', () => {
    expect(updatePreferencesSchema.safeParse({ refresh_interval: 301 }).success).toBe(false);
  });
});
