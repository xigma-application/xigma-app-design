// utils
import { getUnrotatedQueryPoint } from '../getUnrotatedQueryPoint';

describe('getUnrotatedQueryPoint', () => {
  it('should return the exact same point reference when rotation is 0', () => {
    // mock
    const point = { x: 37, y: -12 };

    // result
    expect(getUnrotatedQueryPoint(point, { height: 20, width: 20, x: 0, y: 0 }, 0)).toBe(point);
  });

  it("should rotate the point backwards around the bounds' own center", () => {
    // mock — bounds centered at (50, 50); a point 90deg clockwise of the center, rotated back by
    const bounds = { height: 100, width: 100, x: 0, y: 0 };

    // result
    const result = getUnrotatedQueryPoint({ x: 50, y: 150 }, bounds, 90);

    expect(result.x).toBeCloseTo(150);
    expect(result.y).toBeCloseTo(50);
  });
});
