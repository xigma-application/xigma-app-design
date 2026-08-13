// utils
import { rotatePoint } from '../rotatePoint';

describe('rotatePoint', () => {
  it('should return the exact same point reference when degrees is 0', () => {
    // mock
    const point = { x: 10, y: 5 };

    // result
    expect(rotatePoint(point, { x: 0, y: 0 }, 0)).toBe(point);
  });

  it('should return the same coordinates when rotating a point around itself', () => {
    // mock — the key property that makes single-node rotation collapse out of the group formula
    const point = { x: 37, y: -12 };

    // result
    expect(rotatePoint(point, point, 90)).toEqual(point);
  });

  it('should rotate a point 90 degrees clockwise around a center', () => {
    // result — (10, 0) around origin, 90deg clockwise (y-down screen space) lands on (0, 10)
    const result = rotatePoint({ x: 10, y: 0 }, { x: 0, y: 0 }, 90);

    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(10);
  });

  it('should rotate a point 180 degrees around an off-origin center', () => {
    // result — 180deg around a center just flips the point to the opposite side
    const result = rotatePoint({ x: 15, y: 5 }, { x: 10, y: 5 }, 180);

    expect(result.x).toBeCloseTo(5);
    expect(result.y).toBeCloseTo(5);
  });
});
