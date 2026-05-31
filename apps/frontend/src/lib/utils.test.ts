import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('handles conditional classes', () => {
    const show = false;

    expect(cn('base', show && 'hidden', 'visible')).toBe('base visible');
  });

  it('deduplicates tailwind utilities', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('returns empty string for no args', () => {
    expect(cn()).toBe('');
  });

  it('handles arrays of classes', () => {
    expect(cn(['px-2', 'py-1'], 'text-sm')).toBe('px-2 py-1 text-sm');
  });
});
