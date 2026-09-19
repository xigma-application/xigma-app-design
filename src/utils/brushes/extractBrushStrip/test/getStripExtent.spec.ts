// utils
import { createAlpha } from '../../test/brushFixtures';
import { getStripExtent } from '../getStripExtent';

const band = createAlpha(60, 40, (x, y) => x >= 5 && y >= 15 && y < 25);
const frames = Array.from({ length: 40 }, (_, index) => ({ normal: { x: 0, y: 1 }, x: 10 + index, y: 20 }));

describe('getStripExtent', () => {
  it('should be the farthest opaque reach from the centre line along the normal', () => {
    // result
    expect(getStripExtent(band, frames)).toBeGreaterThanOrEqual(4.5);
    expect(getStripExtent(band, frames)).toBeLessThanOrEqual(5.5);
  });

  it('should be zero for an empty image', () => {
    // result
    expect(
      getStripExtent(
        createAlpha(60, 40, () => false),
        frames,
      ),
    ).toBe(0);
  });
});
