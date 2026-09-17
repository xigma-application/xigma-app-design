// utils
import { getFlippedImageFillUv } from '../getFlippedImageFillUv';

const uv = { uMax: 0.75, uMin: 0.25, vMax: 1, vMin: 0 };

describe('getFlippedImageFillUv', () => {
  it('should return the uv unchanged when neither axis is flipped', () => {
    // before
    const result = getFlippedImageFillUv(uv, false, false);

    // result
    expect(result).toEqual(uv);
  });

  it('should swap uMin/uMax when flipX is set, leaving the v axis untouched', () => {
    // before
    const result = getFlippedImageFillUv(uv, true, false);

    // result
    expect(result).toEqual({ uMax: 0.25, uMin: 0.75, vMax: 1, vMin: 0 });
  });

  it('should swap vMin/vMax when flipY is set, leaving the u axis untouched', () => {
    // before
    const result = getFlippedImageFillUv(uv, false, true);

    // result
    expect(result).toEqual({ uMax: 0.75, uMin: 0.25, vMax: 0, vMin: 1 });
  });

  it('should swap both axes when both flipX and flipY are set', () => {
    // before
    const result = getFlippedImageFillUv(uv, true, true);

    // result
    expect(result).toEqual({ uMax: 0.25, uMin: 0.75, vMax: 0, vMin: 1 });
  });
});
