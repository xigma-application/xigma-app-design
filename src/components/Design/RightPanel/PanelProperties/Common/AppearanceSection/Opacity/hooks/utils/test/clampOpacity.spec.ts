// utils
import { clampOpacity } from '../clampOpacity';

describe('clampOpacity', () => {
  it('should round a fractional value', () => {
    // result
    expect(clampOpacity(49.6)).toBe(50);
  });

  it('should clamp a value above 100 down to 100', () => {
    // result
    expect(clampOpacity(150)).toBe(100);
  });

  it('should clamp a negative value up to 0', () => {
    // result
    expect(clampOpacity(-10)).toBe(0);
  });
});
