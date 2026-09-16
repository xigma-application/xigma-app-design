// utils
import { getImageCropResizeHandleAtPoint } from '../getImageCropResizeHandleAtPoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('getImageCropResizeHandleAtPoint behaviors', () => {
  it('should return the corner handle at an unrotated crop rect corner', () => {
    // before
    const crop = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // result
    expect(getImageCropResizeHandleAtPoint({ x: 0, y: 0 }, crop, IDENTITY_VIEWPORT)).toBe('nw');
  });

  it('should return null far away from every handle', () => {
    // before
    const crop = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // result
    expect(getImageCropResizeHandleAtPoint({ x: 50, y: 50 }, crop, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should unrotate the query point before testing against a rotated crop rect', () => {
    // before — a 90deg-rotated 100x100 square centered at (50,50): the point that is at the
    // rotated top-left visually is the rect's own top-right corner in local space
    const crop = { height: 100, rotation: 90, width: 100, x: 0, y: 0 };

    // result
    expect(getImageCropResizeHandleAtPoint({ x: 100, y: 0 }, crop, IDENTITY_VIEWPORT)).toBe('nw');
  });
});
