// utils
import { rotateFlatVertices } from '../rotateFlatVertices';

describe('rotateFlatVertices', () => {
  it('should rotate a single flat [x, y] pair around the given center', () => {
    // result — (10, 0) rotated 90deg around the origin swings to (0, 10)
    const [x, y] = rotateFlatVertices([10, 0], { x: 0, y: 0 }, 90);

    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(10);
  });

  it('should leave the vertices unchanged at rotation 0', () => {
    // result
    expect(rotateFlatVertices([1, 2, 3, 4], { x: 0, y: 0 }, 0)).toEqual([1, 2, 3, 4]);
  });

  it('should rotate every [x, y] pair in a longer flat list independently', () => {
    // result — two points, (10, 0) and (0, 10), both rotated 90deg around the origin
    const rotated = rotateFlatVertices([10, 0, 0, 10], { x: 0, y: 0 }, 90);

    expect(rotated[0]).toBeCloseTo(0);
    expect(rotated[1]).toBeCloseTo(10);
    expect(rotated[2]).toBeCloseTo(-10);
    expect(rotated[3]).toBeCloseTo(0);
  });
});
