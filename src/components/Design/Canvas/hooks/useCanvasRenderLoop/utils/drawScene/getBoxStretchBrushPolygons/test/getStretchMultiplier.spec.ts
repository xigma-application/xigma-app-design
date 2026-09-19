// types
import { StrokeBrushDirection, StrokeProfile } from 'types/design/enums';

// utils
import { getStretchMultiplier } from '../getStretchMultiplier';

describe('getStretchMultiplier', () => {
  it('should taper from full to the end width going right', () => {
    // result
    expect(getStretchMultiplier(0, 100, StrokeBrushDirection.right, 0.4, StrokeProfile.uniform, false)).toBe(1);
    expect(getStretchMultiplier(100, 100, StrokeBrushDirection.right, 0.4, StrokeProfile.uniform, false)).toBeCloseTo(0.4);
  });

  it('should taper the other way going left', () => {
    // result
    expect(getStretchMultiplier(0, 100, StrokeBrushDirection.left, 0.4, StrokeProfile.uniform, false)).toBeCloseTo(0.4);
    expect(getStretchMultiplier(100, 100, StrokeBrushDirection.left, 0.4, StrokeProfile.uniform, false)).toBe(1);
  });

  it('should multiply by the width profile', () => {
    // result
    expect(getStretchMultiplier(50, 100, StrokeBrushDirection.right, 1, StrokeProfile.wedge, false)).toBeCloseTo(0.5);
  });
});
