// utils
import { getThumbOffset } from '../getThumbOffset';

describe('getThumbOffset', () => {
  it('should reach the exact left edge at fraction 0, so the thumb center sits on the edge', () => {
    expect(getThumbOffset(0)).toBe('0%');
  });

  it('should reach the exact right edge at fraction 1, so the thumb center sits on the edge', () => {
    expect(getThumbOffset(1)).toBe('100%');
  });

  it('should scale linearly by the fraction in between', () => {
    expect(getThumbOffset(0.5)).toBe('50%');
  });
});
