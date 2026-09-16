// utils
import { isPointInImageCropRect } from '../isPointInImageCropRect';

describe('isPointInImageCropRect behaviors', () => {
  it('should return true for a point inside an unrotated crop rect', () => {
    // before
    const crop = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // result
    expect(isPointInImageCropRect({ x: 50, y: 50 }, crop)).toBe(true);
  });

  it('should return false for a point outside the crop rect', () => {
    // before
    const crop = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // result
    expect(isPointInImageCropRect({ x: 200, y: 200 }, crop)).toBe(false);
  });

  it('should unrotate the point before testing against a rotated crop rect', () => {
    // before — a 100x100 rect rotated 45deg around its own center (50,50)
    const crop = { height: 100, rotation: 45, width: 100, x: 0, y: 0 };

    // result
    expect(isPointInImageCropRect({ x: 50, y: 50 }, crop)).toBe(true);
    expect(isPointInImageCropRect({ x: 50, y: -100 }, crop)).toBe(false);
  });
});
