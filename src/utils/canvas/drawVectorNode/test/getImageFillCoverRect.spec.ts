// utils
import { getImageFillCoverRect } from '../getImageFillCoverRect';

describe('getImageFillCoverRect', () => {
  it('should grow a relatively wide image beyond the bounds width, centering it horizontally', () => {
    // before — 100x100 bounds, a 200x100 (2:1) image: covers at 200x100, centered horizontally
    const rect = getImageFillCoverRect({ height: 100, width: 100, x: 0, y: 0 }, 200, 100);

    // result
    expect(rect).toEqual({ height: 100, width: 200, x: -50, y: 0 });
  });

  it('should grow a relatively tall image beyond the bounds height, centering it vertically', () => {
    // before — 100x100 bounds, a 100x200 (1:2) image: covers at 100x200, centered vertically
    const rect = getImageFillCoverRect({ height: 100, width: 100, x: 0, y: 0 }, 100, 200);

    // result
    expect(rect).toEqual({ height: 200, width: 100, x: 0, y: -50 });
  });

  it('should return the full bounds unchanged when the image shares the same aspect ratio', () => {
    // before
    const rect = getImageFillCoverRect({ height: 50, width: 100, x: 10, y: 20 }, 400, 200);

    // result
    expect(rect).toEqual({ height: 50, width: 100, x: 10, y: 20 });
  });

  it('should fall back to the full bounds when the image size is not known yet', () => {
    // before
    const bounds = { height: 100, width: 100, x: 0, y: 0 };
    const rect = getImageFillCoverRect(bounds, 0, 0);

    // result
    expect(rect).toEqual(bounds);
  });

  it('should fall back to the full bounds when the bounds have no area', () => {
    // before
    const bounds = { height: 0, width: 0, x: 5, y: 5 };
    const rect = getImageFillCoverRect(bounds, 100, 100);

    // result
    expect(rect).toEqual(bounds);
  });
});
