// utils
import { getShapeDraftRect } from '../getShapeDraftRect';

describe('getShapeDraftRect', () => {
  it('should return a free-form rect when Shift is not held', () => {
    // before
    const rect = getShapeDraftRect({ x: 10, y: 10 }, { x: 60, y: 40 }, false);

    // result
    expect(rect).toEqual({ height: 30, width: 50, x: 10, y: 10 });
  });

  it('should lock the rect to a 1:1 square, driven by the larger axis, when Shift is held', () => {
    // before — width (50) drives, since it exceeds height (30)
    const rect = getShapeDraftRect({ x: 10, y: 10 }, { x: 60, y: 40 }, true);

    // result
    expect(rect).toEqual({ height: 50, width: 50, x: 10, y: 10 });
  });

  it('should keep the square anchored at the drag start regardless of which direction the cursor moves', () => {
    // before — dragging up-left from the start point; width (50) still exceeds height (15) and drives
    const rect = getShapeDraftRect({ x: 60, y: 40 }, { x: 10, y: 25 }, true);

    // result — anchored at the start point, growing up-left from it
    expect(rect).toEqual({ height: 50, width: 50, x: 10, y: -10 });
  });

  it('should round a fractional lock result to whole pixels', () => {
    // before
    const rect = getShapeDraftRect({ x: 10.2, y: 10.6 }, { x: 60.4, y: 40.5 }, true);

    // result
    expect(rect).toEqual({ height: 50, width: 50, x: 10, y: 11 });
  });
});
