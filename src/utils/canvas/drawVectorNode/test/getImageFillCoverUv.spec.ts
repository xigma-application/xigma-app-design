// utils
import { getImageFillCoverUv } from '../getImageFillCoverUv';

describe('getImageFillCoverUv', () => {
  it('should return the full 0..1 range when the bounds are wider than the image (no crop needed on that axis) but should crop vertically', () => {
    // before
    const uv = getImageFillCoverUv(200, 100, 100, 100);

    // result — bounds is 2:1, image is 1:1, so the full image width is used and only the vertical band that fits is shown
    expect(uv).toEqual({ uMax: 1, uMin: 0, vMax: 0.75, vMin: 0.25 });
  });

  it('should crop horizontally and use the full image height when the image is relatively wider than the bounds', () => {
    // before
    const uv = getImageFillCoverUv(100, 100, 200, 100);

    // result — bounds is 1:1, image is 2:1, so only the centered square portion of the image width is shown
    expect(uv).toEqual({ uMax: 0.75, uMin: 0.25, vMax: 1, vMin: 0 });
  });

  it('should return the full range with no crop when the bounds and image share the same aspect ratio', () => {
    // before
    const uv = getImageFillCoverUv(100, 50, 400, 200);

    // result
    expect(uv).toEqual({ uMax: 1, uMin: 0, vMax: 1, vMin: 0 });
  });

  it('should fall back to the full range when the image size is not known yet', () => {
    // before
    const uv = getImageFillCoverUv(100, 100, 0, 0);

    // result
    expect(uv).toEqual({ uMax: 1, uMin: 0, vMax: 1, vMin: 0 });
  });

  it('should fall back to the full range when the bounds have no area', () => {
    // before
    const uv = getImageFillCoverUv(0, 0, 100, 100);

    // result
    expect(uv).toEqual({ uMax: 1, uMin: 0, vMax: 1, vMin: 0 });
  });
});
