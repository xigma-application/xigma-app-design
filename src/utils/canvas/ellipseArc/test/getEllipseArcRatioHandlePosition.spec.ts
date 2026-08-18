// utils
import { getEllipseArcRatioHandlePosition } from '../getEllipseArcRatioHandlePosition';

const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getEllipseArcRatioHandlePosition', () => {
  it('should rest at the dead center when arcRatio is 0, regardless of angle', () => {
    // result
    expect(getEllipseArcRatioHandlePosition(BOUNDS, 0, 90, 0)).toEqual({ x: 50, y: 50 });
  });

  it('should sit on the bisector of the filled majority arc when not inverted', () => {
    // result — majorArc(0, 90) is {majorStart: 90, majorSweep: 270}, bisector 225°
    const position = getEllipseArcRatioHandlePosition(BOUNDS, 0, 90, 1);

    expect(position.x).toBeCloseTo(14.644661, 4);
    expect(position.y).toBeCloseTo(85.355339, 4);
  });

  it('should sit on the bisector of the complementary (gap) arc when inverted', () => {
    // result — the mirror-opposite point from the non-inverted case above
    const position = getEllipseArcRatioHandlePosition(BOUNDS, 0, 90, 1, false, false, true);

    expect(position.x).toBeCloseTo(85.355339, 4);
    expect(position.y).toBeCloseTo(14.644661, 4);
  });

  it('should mirror across the center when flipX/flipY are set', () => {
    // mock
    const unflipped = getEllipseArcRatioHandlePosition(BOUNDS, 0, 90, 1);

    // result
    const flipped = getEllipseArcRatioHandlePosition(BOUNDS, 0, 90, 1, true, true);

    expect(flipped.x).toBeCloseTo(100 - unflipped.x, 4);
    expect(flipped.y).toBeCloseTo(100 - unflipped.y, 4);
  });
});
