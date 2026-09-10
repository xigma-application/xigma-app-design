// utils
import { clampGridChildSpan } from '../clampGridChildSpan';

describe('clampGridChildSpan', () => {
  it('should parse a valid integer string within the bound', () => {
    expect(clampGridChildSpan('2', 4)).toBe(2);
  });

  it('should return null for a non-numeric string', () => {
    expect(clampGridChildSpan('', 4)).toBeNull();
    expect(clampGridChildSpan('abc', 4)).toBeNull();
  });

  it('should return null below 1', () => {
    expect(clampGridChildSpan('0', 4)).toBeNull();
    expect(clampGridChildSpan('-2', 4)).toBeNull();
  });

  it('should return null past the current grid bound', () => {
    expect(clampGridChildSpan('5', 4)).toBeNull();
  });

  it('should accept the exact bounds', () => {
    expect(clampGridChildSpan('1', 4)).toBe(1);
    expect(clampGridChildSpan('4', 4)).toBe(4);
  });
});
