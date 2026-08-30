// utils
import { getNextGroupChildPoint } from '../getNextGroupChildPoint';

describe('getNextGroupChildPoint', () => {
  it('should map a point linearly into the resized box for a non-rotated, non-mirrored group', () => {
    const nextPoint = getNextGroupChildPoint(
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { height: 100, width: 200, x: 0, y: 0 },
      { x: 1, y: 1 },
    );

    expect(nextPoint({ x: 50, y: 50 })).toEqual({ x: 100, y: 50 });
  });

  it('should mirror the mapped fraction when the mirror sign is negative', () => {
    const nextPoint = getNextGroupChildPoint(
      { height: 100, width: 100, x: 0, y: 0 },
      0,
      { height: 100, width: 30, x: 100, y: 0 },
      { x: -1, y: 1 },
    );

    // a point 20% across the old box ends up 80% across the new box
    const result = nextPoint({ x: 20, y: 50 });

    expect(result.x).toBeCloseTo(124, 4);
  });
});
