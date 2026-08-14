// utils
import { getSignedScale } from '../getSignedScale';

describe('getSignedScale', () => {
  it('should return 1 when the axis has no anchor (untouched axis)', () => {
    // result
    expect(getSignedScale(10, 30, 0, 20, null)).toBe(1);
  });

  it('should return 1 when the anchor sits exactly on the origin center, to avoid dividing by zero', () => {
    // result
    expect(getSignedScale(0, 20, 0, 20, 10)).toBe(1);
  });

  it('should return a scale greater than 1 when the new box grows further from the anchor', () => {
    // mock — origin 0..20 (center 10) anchored at x=0; new box grows to 0..40 (center 20)
    // result
    expect(getSignedScale(0, 40, 0, 20, 0)).toBe(2);
  });

  it('should return a negative scale when the new box crosses to the other side of the anchor', () => {
    // mock — origin 0..20 (center 10) anchored at x=0; new box sits at -20..0 (center -10)
    // result
    expect(getSignedScale(-20, 20, 0, 20, 0)).toBe(-1);
  });
});
