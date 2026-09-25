// utils
import { getNestingOrientedLoops } from '../getNestingOrientedLoops';

const square = (size: number, offset: number): { x: number; y: number }[] => [
  { x: offset, y: offset },
  { x: offset + size, y: offset },
  { x: offset + size, y: offset + size },
  { x: offset, y: offset + size },
];

const getSignedArea = (loop: { x: number; y: number }[]): number =>
  loop.reduce((sum, point, index) => sum + point.x * loop[(index + 1) % loop.length].y - loop[(index + 1) % loop.length].x * point.y, 0);

describe('getNestingOrientedLoops', () => {
  it('should wind outermost loops one way and the holes inside them the other way', () => {
    // before
    const [outer, hole] = getNestingOrientedLoops([[...square(10, 0)].reverse(), square(4, 3)]);

    // result
    expect(getSignedArea(outer)).toBeGreaterThan(0);
    expect(getSignedArea(hole)).toBeLessThan(0);
  });

  it('should wind side-by-side loops the same way so they add up', () => {
    // before
    const loops = getNestingOrientedLoops([square(4, 0), [...square(4, 10)].reverse()]);

    // result
    expect(loops.every((loop) => getSignedArea(loop) > 0)).toBe(true);
  });
});
