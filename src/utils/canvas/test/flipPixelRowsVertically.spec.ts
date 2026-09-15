// utils
import { flipPixelRowsVertically } from '../flipPixelRowsVertically';

describe('flipPixelRowsVertically', () => {
  it('should swap the top and bottom rows of a 2-row image', () => {
    // before
    // prettier-ignore
    const pixels = new Uint8Array([
      1, 1, 1, 1, /* bottom row (row 0 in GL readback) */ 2, 2, 2, 2,
      3, 3, 3, 3, /* top row (row 1 in GL readback) */ 4, 4, 4, 4,
    ]);

    // action
    const flipped = flipPixelRowsVertically(pixels, 2, 2);

    // result — the readback's last row becomes the first row of the upright image
    expect(Array.from(flipped)).toEqual([3, 3, 3, 3, 4, 4, 4, 4, 1, 1, 1, 1, 2, 2, 2, 2]);
  });

  it('should leave a single-row image unchanged', () => {
    // before
    const pixels = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80]);

    // action
    const flipped = flipPixelRowsVertically(pixels, 2, 1);

    // result
    expect(Array.from(flipped)).toEqual([10, 20, 30, 40, 50, 60, 70, 80]);
  });

  it('should not mutate the source buffer', () => {
    // before
    const pixels = new Uint8Array([1, 1, 1, 1, 2, 2, 2, 2]);
    const original = Array.from(pixels);

    // action
    flipPixelRowsVertically(pixels, 1, 2);

    // result
    expect(Array.from(pixels)).toEqual(original);
  });
});
