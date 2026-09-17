// utils
import { scaleAxis } from '../scaleAxis';

describe('scaleAxis', () => {
  it('should leave the value unchanged when the anchor is null', () => {
    // result
    expect(scaleAxis(10, null, 3)).toBe(10);
  });

  it('should scale the value around the anchor by the given scale', () => {
    // result
    expect(scaleAxis(20, 0, 2)).toBe(40);
  });

  it('should keep the anchor itself fixed regardless of scale', () => {
    // result
    expect(scaleAxis(50, 50, 4)).toBe(50);
  });

  it('should scale toward a non-zero anchor', () => {
    // mock — anchor 10, value 20 is 10 away; scale 0.5 halves that distance to 5, landing at 15
    // result
    expect(scaleAxis(20, 10, 0.5)).toBe(15);
  });
});
