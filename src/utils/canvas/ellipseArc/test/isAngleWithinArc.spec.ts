// utils
import { isAngleWithinArc } from '../isAngleWithinArc';

describe('isAngleWithinArc', () => {
  it('should return true for an angle inside a positive sweep', () => {
    // result
    expect(isAngleWithinArc(45, 0, 90)).toBe(true);
  });

  it('should return false for an angle outside a positive sweep', () => {
    // result
    expect(isAngleWithinArc(100, 0, 90)).toBe(false);
  });

  it('should treat the sweep endpoint itself as inside the arc', () => {
    // result
    expect(isAngleWithinArc(90, 0, 90)).toBe(true);
  });

  it('should return true for an angle inside a negative (reverse-direction) sweep', () => {
    // result — sweeping -90 from 0 covers 270..360, so 315 is inside
    expect(isAngleWithinArc(315, 0, -90)).toBe(true);
  });

  it('should return false for an angle outside a negative sweep', () => {
    // result
    expect(isAngleWithinArc(45, 0, -90)).toBe(false);
  });

  it('should treat the start angle itself as within the arc regardless of sweep sign', () => {
    // result
    expect(isAngleWithinArc(10, 10, 0)).toBe(true);
  });

  it('should return false for any angle other than the start when sweep is exactly 0', () => {
    // result — Math.sign(0) would collapse the offset direction without the `|| 1` fallback
    expect(isAngleWithinArc(11, 10, 0)).toBe(false);
  });

  it('should normalize angles past a full turn before comparing', () => {
    // result — -315 normalizes to 45, inside a 90° positive sweep from 0
    expect(isAngleWithinArc(-315, 0, 90)).toBe(true);
  });
});
