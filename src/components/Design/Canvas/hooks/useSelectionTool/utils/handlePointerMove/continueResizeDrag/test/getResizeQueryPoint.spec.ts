// utils
import { getResizeQueryPoint } from '../getResizeQueryPoint';

describe('getResizeQueryPoint', () => {
  it('should return the raw point unchanged when there is no single rotated node origin', () => {
    // mock
    const rawPoint = { x: 37, y: -12 };
    const bounds = { height: 100, width: 100, x: 0, y: 0 };

    // result
    expect(getResizeQueryPoint(rawPoint, bounds, null)).toBe(rawPoint);
  });

  it('should return the raw point unchanged when the single node origin has no rotation', () => {
    // mock
    const rawPoint = { x: 37, y: -12 };
    const bounds = { height: 100, width: 100, x: 0, y: 0 };
    const origin = { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // result
    expect(getResizeQueryPoint(rawPoint, bounds, origin)).toBe(rawPoint);
  });

  it("should rotate the point back into the single rotated node's own local frame", () => {
    // mock — bounds centered at (50, 50); a point 90deg clockwise of the center, rotated back by
    // 90deg lands directly south of it
    const bounds = { height: 100, width: 100, x: 0, y: 0 };
    const origin = { flip: null, height: 100, rotation: 90, width: 100, x: 0, y: 0 };

    // result
    const result = getResizeQueryPoint({ x: 50, y: 150 }, bounds, origin);

    expect(result.x).toBeCloseTo(150);
    expect(result.y).toBeCloseTo(50);
  });
});
