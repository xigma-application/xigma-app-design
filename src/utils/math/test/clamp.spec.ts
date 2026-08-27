// utils
import { clamp } from '../clamp';

describe('clamp', () => {
  it('should return the value unchanged when it is within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('should return the min when the value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('should return the max when the value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('should return the boundary value unchanged when it exactly equals min or max', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});
