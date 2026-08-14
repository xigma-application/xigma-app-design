// utils
import { getScaleAxisScale } from '../getScaleAxisScale';

describe('getScaleAxisScale', () => {
  it('should return a direct size ratio for a center-anchored (untouched) axis', () => {
    // result
    expect(getScaleAxisScale('none', -50, 200, 0, 100, 50)).toBe(2);
  });

  it('should defer to getSignedScale for an edge/corner-anchored axis', () => {
    // result — matches getSignedScale's own anchor-distance formula directly
    expect(getScaleAxisScale('max', 0, 150, 0, 100, 0)).toBe(1.5);
  });
});
