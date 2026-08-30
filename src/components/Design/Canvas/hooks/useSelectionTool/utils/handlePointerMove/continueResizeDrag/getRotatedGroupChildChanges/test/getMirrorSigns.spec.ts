// utils
import { getMirrorSigns } from '../getMirrorSigns';

describe('getMirrorSigns', () => {
  it('should return {1,1} when the box only grows, no anchor corner crosses', () => {
    expect(getMirrorSigns({ height: 100, width: 100, x: 0, y: 0 }, { height: 100, width: 200, x: 0, y: 0 }, 0)).toEqual({ x: 1, y: 1 });
  });

  it('should return x:-1 when the drag crosses the anchor horizontally', () => {
    // the right edge (x=100) stays fixed; the box ends up to the right of it
    expect(getMirrorSigns({ height: 100, width: 100, x: 0, y: 0 }, { height: 100, width: 30, x: 100, y: 0 }, 0)).toEqual({ x: -1, y: 1 });
  });

  it('should return y:-1 when the drag crosses the anchor vertically', () => {
    // the bottom edge (y=100) stays fixed; the box ends up below it
    expect(getMirrorSigns({ height: 100, width: 100, x: 0, y: 0 }, { height: 30, width: 100, x: 0, y: 100 }, 0)).toEqual({ x: 1, y: -1 });
  });
});
