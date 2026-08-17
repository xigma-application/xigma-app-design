// utils
import { getCornerRadiusHandleEffectiveSetback } from '../getCornerRadiusHandleEffectiveSetback';

describe('getCornerRadiusHandleEffectiveSetback', () => {
  it('should scale the literal radius by the setback multiplier when the radius is positive', () => {
    // result
    expect(getCornerRadiusHandleEffectiveSetback(10, 50, 2, 30, false)).toBe(20);
  });

  it('should clamp the literal radius to maxRadius before scaling', () => {
    // result
    expect(getCornerRadiusHandleEffectiveSetback(1000, 25, 2, 30, false)).toBe(50);
  });

  it('should fall back to the zero-state offset when the radius is 0 and not dragging', () => {
    // result
    expect(getCornerRadiusHandleEffectiveSetback(0, 50, 2, 12, false)).toBe(12);
  });

  it('should clamp the zero-state offset to maxRadius * setbackMultiplier when it would overshoot', () => {
    // result — maxRadius (5) * setbackMultiplier (2) = 10, below the 30 zero-state offset
    expect(getCornerRadiusHandleEffectiveSetback(0, 5, 2, 30, false)).toBe(10);
  });

  it('should use the literal radius even at 0 while actively dragging, instead of the zero-state offset', () => {
    // result
    expect(getCornerRadiusHandleEffectiveSetback(0, 50, 2, 30, true)).toBe(0);
  });
});
