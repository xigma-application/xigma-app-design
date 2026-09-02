// utils
import { getRulerStep } from '../getRulerStep';

describe('getRulerStep', () => {
  it('should pick a 1 / 2 / 5 × 10ⁿ step that keeps ticks near the target on-screen spacing', () => {
    // result
    expect(getRulerStep(1)).toBe(100);
    expect(getRulerStep(2)).toBe(50);
    expect(getRulerStep(4)).toBe(20);
    expect(getRulerStep(10)).toBe(10);
  });

  it('should scale the step up when zoomed out', () => {
    // result
    expect(getRulerStep(0.5)).toBe(200);
    expect(getRulerStep(0.1)).toBe(1000);
  });

  it('should allow a sub-unit step when zoomed far in', () => {
    // result
    expect(getRulerStep(200)).toBe(0.5);
  });
});
