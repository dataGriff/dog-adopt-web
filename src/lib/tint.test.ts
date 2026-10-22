import { describe, expect, it } from 'vitest';
import { tintFor } from './tint';

describe('tintFor', () => {
  it('gives the same dog the same tint every time', () => {
    expect(tintFor('2b7c0d5a-9c3e-4f0a-8a1b-7e6d5c4b3a21')).toBe(tintFor('2b7c0d5a-9c3e-4f0a-8a1b-7e6d5c4b3a21'));
  });
  it('spreads different dogs across more than one tint', () => {
    const ids = Array.from({ length: 24 }, (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`);
    expect(new Set(ids.map(tintFor)).size).toBeGreaterThan(3);
  });
});
