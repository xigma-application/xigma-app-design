// utils
import { clamp } from '../clamp';

describe('clamp', () => {
  it('should round a fractional value', () => {
    // result
    expect(clamp(4.6)).toBe(5);
  });

  it('should clamp a negative value up to zero', () => {
    // result
    expect(clamp(-3)).toBe(0);
  });
});
