// utils
import { getImageFillContainRect } from '../getImageFillContainRect';

describe('getImageFillContainRect', () => {
  it('should letterbox a relatively wide image, centering it vertically within the bounds', () => {
    // before — 100x100 bounds, a 200x100 (2:1) image: fits at 100x50, centered vertically
    const rect = getImageFillContainRect({ height: 100, width: 100, x: 0, y: 0 }, 200, 100);

    // result
    expect(rect).toEqual({ height: 50, width: 100, x: 0, y: 25 });
  });

  it('should pillarbox a relatively tall image, centering it horizontally within the bounds', () => {
    // before — 100x100 bounds, a 100x200 (1:2) image: fits at 50x100, centered horizontally
    const rect = getImageFillContainRect({ height: 100, width: 100, x: 0, y: 0 }, 100, 200);

    // result
    expect(rect).toEqual({ height: 100, width: 50, x: 25, y: 0 });
  });

  it('should return the full bounds unchanged when the image shares the same aspect ratio', () => {
    // before
    const rect = getImageFillContainRect({ height: 50, width: 100, x: 10, y: 20 }, 400, 200);

    // result
    expect(rect).toEqual({ height: 50, width: 100, x: 10, y: 20 });
  });

  it('should fall back to the full bounds when the image size is not known yet', () => {
    // before
    const bounds = { height: 100, width: 100, x: 0, y: 0 };
    const rect = getImageFillContainRect(bounds, 0, 0);

    // result
    expect(rect).toEqual(bounds);
  });

  it('should fall back to the full bounds when the bounds have no area', () => {
    // before
    const bounds = { height: 0, width: 0, x: 5, y: 5 };
    const rect = getImageFillContainRect(bounds, 100, 100);

    // result
    expect(rect).toEqual(bounds);
  });
});
