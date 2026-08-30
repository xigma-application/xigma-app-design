// utils
import { getShapeSnapPoints } from '../getShapeSnapPoints';

describe('getShapeSnapPoints', () => {
  it('should return the 4 corners, 4 edge midpoints and the centre', () => {
    // action
    const points = getShapeSnapPoints({ height: 40, width: 100, x: 10, y: 20 });

    // result
    expect(points).toEqual([
      { x: 10, y: 20 },
      { x: 60, y: 20 },
      { x: 110, y: 20 },
      { x: 10, y: 40 },
      { x: 60, y: 40 },
      { x: 110, y: 40 },
      { x: 10, y: 60 },
      { x: 60, y: 60 },
      { x: 110, y: 60 },
    ]);
  });

  it('should collapse every point to a single one for a zero-size rect', () => {
    // action
    const points = getShapeSnapPoints({ height: 0, width: 0, x: 5, y: 5 });

    // result
    expect(points.every((point) => point.x === 5 && point.y === 5)).toBe(true);
  });
});
