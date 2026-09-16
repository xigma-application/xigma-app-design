// utils
import { getRotatedFillUvCorner } from '../getRotatedFillUvCorner';

describe('getRotatedFillUvCorner', () => {
  it('should return the same corner unchanged when no rotation is given', () => {
    // before & result
    expect(getRotatedFillUvCorner(0, 0, 0)).toEqual({ u: 0, v: 0 });
    expect(getRotatedFillUvCorner(1, 1, 0)).toEqual({ u: 1, v: 1 });
  });

  // Rotating a photo 90° clockwise moves its left edge to the top — so the corner now displayed
  // at top-left must sample the content that used to sit at the original bottom-left corner.
  it('should sample the original bottom-left content at the displayed top-left corner for a 90° rotation', () => {
    // before
    const uv = getRotatedFillUvCorner(0, 0, 90);

    // result
    expect(uv).toEqual({ u: 0, v: 1 });
  });

  it('should carry every displayed corner to its original 90°-rotated source for a 90° rotation', () => {
    // before & result — displayed TL/TR/BR/BL each read from the original BL/TL/TR/BR corner
    expect(getRotatedFillUvCorner(0, 0, 90)).toEqual({ u: 0, v: 1 });
    expect(getRotatedFillUvCorner(1, 0, 90)).toEqual({ u: 0, v: 0 });
    expect(getRotatedFillUvCorner(1, 1, 90)).toEqual({ u: 1, v: 0 });
    expect(getRotatedFillUvCorner(0, 1, 90)).toEqual({ u: 1, v: 1 });
  });

  it('should flip both axes for a 180° rotation', () => {
    // before & result
    expect(getRotatedFillUvCorner(0, 0, 180)).toEqual({ u: 1, v: 1 });
    expect(getRotatedFillUvCorner(0.25, 0.75, 180)).toEqual({ u: 0.75, v: 0.25 });
  });

  it('should carry every displayed corner to its original 270°-rotated source, the reverse of 90°', () => {
    // before & result — displayed TL/TR/BR/BL each read from the original TR/BR/BL/TL corner
    expect(getRotatedFillUvCorner(0, 0, 270)).toEqual({ u: 1, v: 0 });
    expect(getRotatedFillUvCorner(1, 0, 270)).toEqual({ u: 1, v: 1 });
    expect(getRotatedFillUvCorner(1, 1, 270)).toEqual({ u: 0, v: 1 });
    expect(getRotatedFillUvCorner(0, 1, 270)).toEqual({ u: 0, v: 0 });
  });

  it('should preserve a cropped (non-0..1) corner through a 90° rotation, only swapping axes', () => {
    // before
    const uv = getRotatedFillUvCorner(0.25, 0.75, 90);

    // result
    expect(uv).toEqual({ u: 0.75, v: 0.75 });
  });
});
