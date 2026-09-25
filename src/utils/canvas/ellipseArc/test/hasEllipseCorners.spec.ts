// utils
import { hasEllipseCorners } from '../hasEllipseCorners';

const rect = { height: 10, width: 10, x: 0, y: 0 };

describe('hasEllipseCorners', () => {
  it('should be true for a cut arc with a corner radius', () => {
    // result
    expect(hasEllipseCorners({ ...rect, arcEndAngle: 180, cornerRadius: 4 })).toBe(true);
  });

  it('should be false without a corner radius or without a cut', () => {
    // result
    expect(hasEllipseCorners({ ...rect, arcEndAngle: 180 })).toBe(false);
    expect(hasEllipseCorners({ ...rect, arcRatio: 0.5, cornerRadius: 4 })).toBe(false);
  });
});
