// types
import { TPoint } from 'types/canvas';

// utils
import { getStrokeOutlinePolygons } from '../getStrokeOutlinePolygons';

const expectPointsCloseTo = (actual: TPoint[], expected: TPoint[]): void => {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((point, index) => {
    expect(point.x).toBeCloseTo(expected[index].x);
    expect(point.y).toBeCloseTo(expected[index].y);
  });
};

describe('getStrokeOutlinePolygons', () => {
  it('should return two nested square loops for a closed square loop', () => {
    // mock — a 10x10 square, half-width 1
    const square = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];

    // action
    const result = getStrokeOutlinePolygons(square, 1, true);

    // result — each 90deg corner miters to distance halfWidth*sqrt(2) along its diagonal bisector
    expectPointsCloseTo(result.outer, [
      { x: 1, y: 1 },
      { x: 9, y: 1 },
      { x: 9, y: 9 },
      { x: 1, y: 9 },
    ]);
    expectPointsCloseTo(result.inner as TPoint[], [
      { x: -1, y: -1 },
      { x: 11, y: -1 },
      { x: 11, y: 11 },
      { x: -1, y: 11 },
    ]);
  });

  it('should return a single closed band polygon (with a null inner loop) for an open 2-point path', () => {
    // mock — a horizontal segment, half-width 1
    const line = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];

    // action
    const result = getStrokeOutlinePolygons(line, 1, false);

    // result — a butt-capped rectangle straddling the segment
    expect(result.inner).toBeNull();
    expect(result.outer).toEqual([
      { x: 0, y: 1 },
      { x: 10, y: 1 },
      { x: 10, y: -1 },
      { x: 0, y: -1 },
    ]);
  });

  it('should carry a miter join through an interior vertex of an open multi-segment path', () => {
    // mock — an "L" shaped path: right then down, half-width 1
    const path = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    // action
    const result = getStrokeOutlinePolygons(path, 1, false);

    // result — 3 interior/end points per side, joined into one 6-point closed band
    expect(result.inner).toBeNull();
    expect(result.outer).toHaveLength(6);
  });
});
