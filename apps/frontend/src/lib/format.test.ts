import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCompact, formatPercent } from './format';

describe('formatCurrency', () => {
  it('formats USD values >= 1 with 2 decimals', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('formats EUR values >= 1 with euro symbol', () => {
    expect(formatCurrency(999.99, 'EUR')).toBe('€999,99');
  });

  it('formats values < 1 with 4 decimals', () => {
    const result = formatCurrency(0.1234, 'USD');
    expect(result).toContain('$');
    expect(result).toContain('0.1234');
  });

  it('defaults to USD', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.0000');
  });
});

describe('formatCompact', () => {
  it('formats trillions', () => {
    expect(formatCompact(1.5e12, 'USD')).toBe('$1.50T');
  });

  it('formats billions', () => {
    expect(formatCompact(2.3e9, 'USD')).toBe('$2.30B');
  });

  it('formats millions', () => {
    expect(formatCompact(500e6, 'USD')).toBe('$500.00M');
  });

  it('formats thousands', () => {
    expect(formatCompact(12345, 'USD')).toBe('$12.35K');
  });

  it('formats small numbers', () => {
    expect(formatCompact(999, 'USD')).toBe('$999.00');
  });

  it('formats negative values', () => {
    expect(formatCompact(-1e9, 'USD')).toBe('-$1.00B');
  });

  it('formats EUR', () => {
    expect(formatCompact(1e6, 'EUR')).toBe('€1.00M');
  });
});

describe('formatPercent', () => {
  it('formats positive with +', () => {
    expect(formatPercent(2.34)).toBe('+2.34%');
  });

  it('formats negative without +', () => {
    expect(formatPercent(-1.5)).toBe('-1.50%');
  });

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.00%');
  });
});
