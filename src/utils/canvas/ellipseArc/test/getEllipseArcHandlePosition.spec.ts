// utils
import { getEllipseArcHandlePosition } from '../getEllipseArcHandlePosition';

const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getEllipseArcHandlePosition', () => {
  it('should sit on the outer perimeter (full radius) at the default arcRatio of 0', () => {
    // result — center (50, 50), arcEndAngle 90° (east)
    expect(getEllipseArcHandlePosition(BOUNDS, 90)).toEqual({ x: 100, y: 50 });
  });

  it('should sit at the midpoint of the ring band once arcRatio is above 0', () => {
    // result — radiusRatio = (0.5 + 1) / 2 = 0.75, so the handle sits at 0.75 * 50 = 37.5 from center
    expect(getEllipseArcHandlePosition(BOUNDS, 90, {}, 0.5)).toEqual({ x: 87.5, y: 50 });
  });

  it('should mirror across the center on the x axis when flipX is set', () => {
    // result
    expect(getEllipseArcHandlePosition(BOUNDS, 90, { flipX: true })).toEqual({ x: 0, y: 50 });
  });

  it('should mirror across the center on the y axis when flipY is set', () => {
    // result — arcEndAngle 0° (north) sits at (50, 0); flipY mirrors to (50, 100)
    expect(getEllipseArcHandlePosition(BOUNDS, 0, { flipY: true })).toEqual({ x: 50, y: 100 });
  });
});
