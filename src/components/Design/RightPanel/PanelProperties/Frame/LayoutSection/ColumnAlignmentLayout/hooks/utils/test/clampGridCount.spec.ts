// utils
import { clampGridCount } from '../clampGridCount';

describe('clampGridCount', () => {
  it('should parse a valid integer string', () => {
    expect(clampGridCount('12')).toBe(12);
  });

  it('should return null for a non-numeric string', () => {
    expect(clampGridCount('')).toBeNull();
    expect(clampGridCount('abc')).toBeNull();
  });

  it('should return null below the minimum', () => {
    expect(clampGridCount('0')).toBeNull();
    expect(clampGridCount('-4')).toBeNull();
  });

  it('should return null above the maximum', () => {
    expect(clampGridCount('101')).toBeNull();
  });

  it('should accept the exact bounds', () => {
    expect(clampGridCount('1')).toBe(1);
    expect(clampGridCount('100')).toBe(100);
  });
});
