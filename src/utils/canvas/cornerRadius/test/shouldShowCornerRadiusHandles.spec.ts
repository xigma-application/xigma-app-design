// utils
import { shouldShowCornerRadiusHandles } from '../shouldShowCornerRadiusHandles';

describe('shouldShowCornerRadiusHandles', () => {
  it('should show handles when a 100x100 shape renders at exactly 100 screen px at 100% zoom', () => {
    // result
    expect(shouldShowCornerRadiusHandles({ height: 100, width: 100, x: 0, y: 0 }, { x: 0, y: 0, zoom: 1 })).toBe(true);
  });

  it('should hide handles once zooming out drops that same shape below 100 screen px', () => {
    // result
    expect(shouldShowCornerRadiusHandles({ height: 100, width: 100, x: 0, y: 0 }, { x: 0, y: 0, zoom: 0.9 })).toBe(false);
  });

  it('should show handles for a large shape zoomed out to exactly 100 screen px', () => {
    // result — a 1000x1000 shape at 10% zoom renders at 100 screen px, same as the 100x100 case above
    expect(shouldShowCornerRadiusHandles({ height: 1000, width: 1000, x: 0, y: 0 }, { x: 0, y: 0, zoom: 0.1 })).toBe(true);
  });

  it('should hide handles once that large shape drops below the threshold at a slightly lower zoom', () => {
    // result — 1000x1000 at 9% zoom renders at 90 screen px
    expect(shouldShowCornerRadiusHandles({ height: 1000, width: 1000, x: 0, y: 0 }, { x: 0, y: 0, zoom: 0.09 })).toBe(false);
  });

  it('should use the smaller dimension for a non-square shape', () => {
    // result — 1000x100 at 100% zoom renders at 1000x100 screen px; the smaller side (100) still clears the threshold
    expect(shouldShowCornerRadiusHandles({ height: 100, width: 1000, x: 0, y: 0 }, { x: 0, y: 0, zoom: 1 })).toBe(true);
    // result — the same shape zoomed out below 100% drops the smaller side under the threshold
    expect(shouldShowCornerRadiusHandles({ height: 100, width: 1000, x: 0, y: 0 }, { x: 0, y: 0, zoom: 0.9 })).toBe(false);
  });
});
