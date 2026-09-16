// utils
import { isImageCropRotateHandleAtPoint } from '../isImageCropRotateHandleAtPoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('isImageCropRotateHandleAtPoint behaviors', () => {
  it('should return true just outside a corner of an unrotated crop rect', () => {
    // before
    const crop = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // result
    expect(isImageCropRotateHandleAtPoint({ x: -10, y: -10 }, crop, IDENTITY_VIEWPORT)).toBe(true);
  });

  it('should return false for a point inside the crop rect body', () => {
    // before
    const crop = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // result
    expect(isImageCropRotateHandleAtPoint({ x: 50, y: 50 }, crop, IDENTITY_VIEWPORT)).toBe(false);
  });

  it('should return false far away from any corner', () => {
    // before
    const crop = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // result
    expect(isImageCropRotateHandleAtPoint({ x: -1000, y: -1000 }, crop, IDENTITY_VIEWPORT)).toBe(false);
  });
});
