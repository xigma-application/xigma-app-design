// utils
import { hasEllipseArcRotateHandle } from '../hasEllipseArcRotateHandle';

describe('hasEllipseArcRotateHandle', () => {
  it('should return true for a partial cut', () => {
    // result
    expect(hasEllipseArcRotateHandle(0, 90)).toBe(true);
  });

  it('should return false for a full circle (no cut at all)', () => {
    // result
    expect(hasEllipseArcRotateHandle(90, 90)).toBe(false);
  });

  it('should return false for a fully cut-away shape, unlike hasEllipseArc which stays true there', () => {
    // result — majorSweep collapses to 0, nothing left to grab
    expect(hasEllipseArcRotateHandle(0, 360)).toBe(false);
  });
});
