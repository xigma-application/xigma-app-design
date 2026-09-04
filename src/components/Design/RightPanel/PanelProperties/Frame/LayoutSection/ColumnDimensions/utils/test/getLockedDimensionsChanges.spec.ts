// utils
import { getLockedDimensionsChanges } from '../getLockedDimensionsChanges';

describe('getLockedDimensionsChanges', () => {
  it('should only change the width when unlocked', () => {
    // result
    expect(getLockedDimensionsChanges('width', 200, 100, 50, false)).toEqual({ height: 50, width: 200 });
  });

  it('should only change the height when unlocked', () => {
    // result
    expect(getLockedDimensionsChanges('height', 25, 100, 50, false)).toEqual({ height: 25, width: 100 });
  });

  it('should scale the height to keep the ratio when locked and the width changes', () => {
    // result
    expect(getLockedDimensionsChanges('width', 200, 100, 50, true)).toEqual({ height: 100, width: 200 });
  });

  it('should scale the width to keep the ratio when locked and the height changes', () => {
    // result
    expect(getLockedDimensionsChanges('height', 100, 100, 50, true)).toEqual({ height: 100, width: 200 });
  });

  it('should round the scaled dimension to two decimals', () => {
    // result
    expect(getLockedDimensionsChanges('width', 100, 30, 20, true)).toEqual({ height: 66.67, width: 100 });
  });

  it('should clamp the committed value to the minimum', () => {
    // result
    expect(getLockedDimensionsChanges('width', -10, 100, 50, false)).toEqual({ height: 50, width: 1 });
  });

  it('should fall back to an unscaled change when the base width or height is zero', () => {
    // result
    expect(getLockedDimensionsChanges('width', 200, 0, 50, true)).toEqual({ height: 50, width: 200 });
  });
});
