// utils
import { hasEllipseArc } from '../hasEllipseArc';

describe('hasEllipseArc', () => {
  it('should return true for a partial cut', () => {
    // result
    expect(hasEllipseArc(0, 90)).toBe(true);
  });

  it('should return false for a full circle reached with no cut at all', () => {
    // result
    expect(hasEllipseArc(90, 90)).toBe(false);
  });

  it('should return false for a full circle reached via two full laps', () => {
    // result
    expect(hasEllipseArc(0, 720)).toBe(false);
  });

  it('should return true for a fully cut-away shape (a single full-lap cut, majorSweep collapses to 0)', () => {
    // result
    expect(hasEllipseArc(0, 360)).toBe(true);
  });
});
