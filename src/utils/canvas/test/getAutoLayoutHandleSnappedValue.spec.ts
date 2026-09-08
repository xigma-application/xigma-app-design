// utils
import { getAutoLayoutHandleSnappedValue } from '../getAutoLayoutHandleSnappedValue';

describe('getAutoLayoutHandleSnappedValue', () => {
  it('should round to the nearest integer when Shift is not held', () => {
    expect(getAutoLayoutHandleSnappedValue(12.6, false)).toBe(13);
    expect(getAutoLayoutHandleSnappedValue(12.4, false)).toBe(12);
    expect(getAutoLayoutHandleSnappedValue(-12.6, false)).toBe(-13);
  });

  it('should snap to the nearest multiple of 10 when Shift is held', () => {
    expect(getAutoLayoutHandleSnappedValue(24, true)).toBe(20);
    expect(getAutoLayoutHandleSnappedValue(26, true)).toBe(30);
    expect(getAutoLayoutHandleSnappedValue(-24, true)).toBe(-20);
  });

  it('should leave an already-round value unchanged in either mode', () => {
    expect(getAutoLayoutHandleSnappedValue(40, false)).toBe(40);
    expect(getAutoLayoutHandleSnappedValue(40, true)).toBe(40);
  });
});
