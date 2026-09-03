// utils
import { lerp } from '../lerp';

describe('lerp', () => {
  it('should return the start value at t=0', () => {
    // result
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('should return the end value at t=1', () => {
    // result
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('should return the midpoint at t=0.5', () => {
    // result
    expect(lerp(10, 20, 0.5)).toBe(15);
  });

  it('should extrapolate past the end value when t is greater than 1', () => {
    // result
    expect(lerp(10, 20, 1.5)).toBe(25);
  });
});
