// utils
import { shouldShowEllipseArcHandle } from '../shouldShowEllipseArcHandle';

describe('shouldShowEllipseArcHandle', () => {
  it('should show the handle when a 100x100 shape renders at exactly 100 screen px at 100% zoom', () => {
    // result
    expect(shouldShowEllipseArcHandle({ height: 100, width: 100, x: 0, y: 0 }, { x: 0, y: 0, zoom: 1 })).toBe(true);
  });

  it('should hide the handle once zooming out drops that same shape below 100 screen px', () => {
    // result
    expect(shouldShowEllipseArcHandle({ height: 100, width: 100, x: 0, y: 0 }, { x: 0, y: 0, zoom: 0.9 })).toBe(false);
  });

  it('should use the smaller dimension for a non-square ellipse', () => {
    // result — 1000x100 at 100% zoom renders at 1000x100 screen px; the smaller side (100) still clears the threshold
    expect(shouldShowEllipseArcHandle({ height: 100, width: 1000, x: 0, y: 0 }, { x: 0, y: 0, zoom: 1 })).toBe(true);
    // result — the same shape zoomed out below 100% drops the smaller side under the threshold
    expect(shouldShowEllipseArcHandle({ height: 100, width: 1000, x: 0, y: 0 }, { x: 0, y: 0, zoom: 0.9 })).toBe(false);
  });
});
