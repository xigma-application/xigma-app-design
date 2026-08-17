// utils
import { shouldShowCornerRadiusHandles } from '../shouldShowCornerRadiusHandles';

describe('shouldShowCornerRadiusHandles', () => {
  it('should show handles when a 100x100 shape renders at exactly 100 screen px at 100% zoom', () => {
    // result
    expect(shouldShowCornerRadiusHandles({ height: 100, width: 100, x: 0, y: 0 }, { x: 0, y: 0, zoom: 1 }, 1000)).toBe(true);
  });

  it('should hide handles once zooming out drops that same shape below 100 screen px', () => {
    // result
    expect(shouldShowCornerRadiusHandles({ height: 100, width: 100, x: 0, y: 0 }, { x: 0, y: 0, zoom: 0.9 }, 1000)).toBe(false);
  });

  it('should show handles for a large shape zoomed out to exactly 100 screen px', () => {
    // result — a 1000x1000 shape at 10% zoom renders at 100 screen px, same as the 100x100 case above
    expect(shouldShowCornerRadiusHandles({ height: 1000, width: 1000, x: 0, y: 0 }, { x: 0, y: 0, zoom: 0.1 }, 1000)).toBe(true);
  });

  it('should hide handles once that large shape drops below the threshold at a slightly lower zoom', () => {
    // result — 1000x1000 at 9% zoom renders at 90 screen px
    expect(shouldShowCornerRadiusHandles({ height: 1000, width: 1000, x: 0, y: 0 }, { x: 0, y: 0, zoom: 0.09 }, 1000)).toBe(false);
  });

  it('should use the smaller dimension for a non-square shape', () => {
    // result — 1000x100 at 100% zoom renders at 1000x100 screen px; the smaller side (100) still clears the threshold
    expect(shouldShowCornerRadiusHandles({ height: 100, width: 1000, x: 0, y: 0 }, { x: 0, y: 0, zoom: 1 }, 1000)).toBe(true);
    // result — the same shape zoomed out below 100% drops the smaller side under the threshold
    expect(shouldShowCornerRadiusHandles({ height: 100, width: 1000, x: 0, y: 0 }, { x: 0, y: 0, zoom: 0.9 }, 1000)).toBe(false);
  });

  it('should hide handles once a small nonzero radius renders below the minimum screen gap while zoomed out', () => {
    // mock — a 2000x2000 shape stays well above the shape-size threshold even at 5% zoom (100 screen px),
    // but a 2px radius renders at only 0.1 screen px at that zoom, far below MIN_RADIUS_HANDLE_GAP_PX (12)
    const largeBounds = { height: 2000, width: 2000, x: 0, y: 0 };

    // result
    expect(shouldShowCornerRadiusHandles(largeBounds, { x: 0, y: 0, zoom: 0.05 }, 2)).toBe(false);
  });

  it('should show handles once the radius clears the minimum screen gap, even if small', () => {
    // mock — the same 2px radius clears MIN_RADIUS_HANDLE_GAP_PX (12) once zoom is high enough (2 * 6 = 12)
    const largeBounds = { height: 2000, width: 2000, x: 0, y: 0 };

    // result
    expect(shouldShowCornerRadiusHandles(largeBounds, { x: 0, y: 0, zoom: 6 }, 2)).toBe(true);
  });

  it('should never hide handles at cornerRadius 0, regardless of zoom, since the zero-state offset is always visible', () => {
    // mock — the same large shape, deeply zoomed out
    const largeBounds = { height: 2000, width: 2000, x: 0, y: 0 };

    // result
    expect(shouldShowCornerRadiusHandles(largeBounds, { x: 0, y: 0, zoom: 0.05 }, 0)).toBe(true);
  });

  it('should never hide handles for a too-small radius while a drag is actively in progress', () => {
    // mock — same scenario that hides above, but with isDragging true so the literal position keeps
    // tracking the pointer instead of vanishing mid-gesture
    const largeBounds = { height: 2000, width: 2000, x: 0, y: 0 };

    // result
    expect(shouldShowCornerRadiusHandles(largeBounds, { x: 0, y: 0, zoom: 0.05 }, 2, true)).toBe(true);
  });
});
