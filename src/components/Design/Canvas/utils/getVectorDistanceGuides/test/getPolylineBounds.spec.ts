// utils
import { getPolylineBounds } from '../getPolylineBounds';

describe('getPolylineBounds', () => {
  it('should return a zero-size rect for a single-point polyline', () => {
    expect(getPolylineBounds([{ x: 10, y: 20 }])).toEqual({ height: 0, width: 0, x: 10, y: 20 });
  });

  it('should return the bounding box of a straight two-point polyline', () => {
    expect(
      getPolylineBounds([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ]),
    ).toEqual({ height: 0, width: 100, x: 0, y: 0 });
  });

  it('should return the bounding box of a bent polyline, ignoring point order', () => {
    expect(
      getPolylineBounds([
        { x: 50, y: 100 },
        { x: 0, y: 0 },
        { x: 100, y: 40 },
      ]),
    ).toEqual({ height: 100, width: 100, x: 0, y: 0 });
  });
});
