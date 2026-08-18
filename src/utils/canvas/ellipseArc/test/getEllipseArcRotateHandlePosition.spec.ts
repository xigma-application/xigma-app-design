// utils
import { getEllipseArcHandlePosition } from '../getEllipseArcHandlePosition';
import { getEllipseArcRotateHandlePosition } from '../getEllipseArcRotateHandlePosition';

const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getEllipseArcRotateHandlePosition', () => {
  it('should delegate straight through to getEllipseArcHandlePosition with the same arguments', () => {
    // result — same perimeter formula the Sweep/end-angle handle uses, just keyed on arcStartAngle
    expect(getEllipseArcRotateHandlePosition(BOUNDS, 90, {}, 0.5)).toEqual(getEllipseArcHandlePosition(BOUNDS, 90, {}, 0.5));
  });

  it('should default flip and arcRatio the same way as getEllipseArcHandlePosition', () => {
    // result
    expect(getEllipseArcRotateHandlePosition(BOUNDS, 90)).toEqual({ x: 100, y: 50 });
  });
});
