// utils
import { createAlpha } from '../../test/brushFixtures';
import { getStripSamples } from '../getStripSamples';

const band = createAlpha(60, 40, (x, y) => x >= 5 && y >= 18 && y < 22);
const frames = Array.from({ length: 10 }, (_, index) => ({ normal: { x: 0, y: 1 }, x: 10 + index, y: 20 }));

describe('getStripSamples', () => {
  it('should sample rows across the normal, opaque near the middle and clear at the edges', () => {
    // action
    const data = getStripSamples(band, frames, 5);

    // result
    expect(data).toHaveLength(10 * 11);
    expect(data[5 * 10 + 3]).toBe(1);
    expect(data[0 * 10 + 3]).toBe(0);
    expect(data[10 * 10 + 3]).toBe(0);
  });
});
