// utils
import { getImageFillTileUv } from '../getImageFillTileUv';

describe('getImageFillTileUv', () => {
  it('should repeat the image once per axis when the tile size (image size at 100% scale) matches the bounds', () => {
    // before
    const uv = getImageFillTileUv(100, 100, 100, 100, 1);

    // result
    expect(uv).toEqual({ uMax: 1, uMin: 0, vMax: 1, vMin: 0 });
  });

  it('should repeat the image more times per axis as the scale shrinks the tile', () => {
    // before
    const uv = getImageFillTileUv(100, 100, 100, 100, 0.5);

    // result — each tile is 50x50, so the 100x100 bounds fit 2 repeats per axis
    expect(uv).toEqual({ uMax: 2, uMin: 0, vMax: 2, vMin: 0 });
  });

  it('should show less than one full repeat when the scale grows the tile past the bounds', () => {
    // before
    const uv = getImageFillTileUv(100, 100, 100, 100, 2);

    // result — each tile is 200x200, so only half of it fits along each axis
    expect(uv).toEqual({ uMax: 0.5, uMin: 0, vMax: 0.5, vMin: 0 });
  });

  it('should repeat each axis independently based on its own bounds/image ratio', () => {
    // before
    const uv = getImageFillTileUv(300, 100, 100, 50, 1);

    // result — 300/100 = 3 repeats horizontally, 100/50 = 2 repeats vertically
    expect(uv).toEqual({ uMax: 3, uMin: 0, vMax: 2, vMin: 0 });
  });

  it('should fall back to the full range when the image size is not known yet', () => {
    // before
    const uv = getImageFillTileUv(100, 100, 0, 0, 1);

    // result
    expect(uv).toEqual({ uMax: 1, uMin: 0, vMax: 1, vMin: 0 });
  });

  it('should fall back to the full range when the bounds have no area', () => {
    // before
    const uv = getImageFillTileUv(0, 0, 100, 100, 1);

    // result
    expect(uv).toEqual({ uMax: 1, uMin: 0, vMax: 1, vMin: 0 });
  });

  it('should fall back to the full range when the scale is zero or negative', () => {
    // before
    const uv = getImageFillTileUv(100, 100, 100, 100, 0);

    // result
    expect(uv).toEqual({ uMax: 1, uMin: 0, vMax: 1, vMin: 0 });
  });
});
