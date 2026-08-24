// utils
import { simplifyPencilPoints } from '../simplifyPencilPoints';

describe('simplifyPencilPoints', () => {
  it('should return the input unchanged when there are 2 or fewer points', () => {
    // result
    expect(simplifyPencilPoints([], 4)).toEqual([]);
    expect(simplifyPencilPoints([{ x: 0, y: 0 }], 4)).toEqual([{ x: 0, y: 0 }]);
    expect(
      simplifyPencilPoints(
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        4,
      ),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ]);
  });

  it('should collapse a straight run of points down to just its endpoints', () => {
    // mock — every interior point lies exactly on the line from (0,0) to (10,0)
    const points = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 5, y: 0 },
      { x: 8, y: 0 },
      { x: 10, y: 0 },
    ];

    // result
    expect(simplifyPencilPoints(points, 1)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);
  });

  it('should keep a point whose perpendicular distance from the chord exceeds the tolerance', () => {
    // mock — the middle point bulges 5px away from the (0,0)->(10,0) chord
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
      { x: 10, y: 0 },
    ];

    // result
    expect(simplifyPencilPoints(points, 1)).toEqual(points);
  });

  it('should drop a point whose perpendicular distance from the chord is within the tolerance', () => {
    // mock — the middle point bulges only 0.5px away from the chord, under a tolerance of 1
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 0.5 },
      { x: 10, y: 0 },
    ];

    // result
    expect(simplifyPencilPoints(points, 1)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);
  });

  it('should recurse into both halves when the farthest point splits the run', () => {
    // mock — a sharp zigzag: (0,0) -> (5,5) -> (10,0) -> (15,5) -> (20,0); each vertex bulges far
    // enough from its local chord to survive simplification, so all 5 points must remain
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
      { x: 10, y: 0 },
      { x: 15, y: 5 },
      { x: 20, y: 0 },
    ];

    // result
    expect(simplifyPencilPoints(points, 1)).toEqual(points);
  });

  it('should fall back to distance-from-lineStart when the chord has zero length', () => {
    // mock — first and last points coincide (a closed loop), so the chord direction is undefined;
    // the middle point sits 5px away, well past the tolerance, so it must be kept
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
      { x: 0, y: 0 },
    ];

    // result
    expect(simplifyPencilPoints(points, 1)).toEqual(points);
  });
});
