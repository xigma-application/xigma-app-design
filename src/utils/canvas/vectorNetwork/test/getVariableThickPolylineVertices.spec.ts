// utils
import { getVariableThickPolylineVertices } from '../getVariableThickPolylineVertices';

describe('getVariableThickPolylineVertices', () => {
  it('should build one asymmetric quad for a straight two-point polyline', () => {
    // mock — a horizontal segment, wider on the left (2) than the right (3)
    const vertices = getVariableThickPolylineVertices(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      [2, 2],
      [3, 3],
    );

    // result
    expect(vertices).toEqual([0, 2, 10, 2, 10, -3, 0, 2, 10, -3, 0, -3]);
  });

  it('should skip a degenerate zero-length sub-segment without producing NaN vertices', () => {
    // mock — two coincident points followed by a real one
    const vertices = getVariableThickPolylineVertices(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      [2, 2, 2],
      [2, 2, 2],
    );

    // result
    expect(vertices.every((value) => Number.isFinite(value))).toBe(true);
  });

  it('should fill the interior corner with a two-triangle fan on each side, matching the two segment normals', () => {
    // mock — an L-shaped corner: (0,0)->(10,0)->(10,10), uniform offset 2 both sides
    const vertices = getVariableThickPolylineVertices(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      [2, 2, 2],
      [2, 2, 2],
    );

    // result — two quads (24 numbers) followed by the corner's left/right fan triangles (12 numbers)
    expect(vertices).toHaveLength(36);
    expect(vertices.slice(-12)).toEqual([10, 0, 10, 2, 8, 0, 10, 0, 10, -2, 12, 0]);
  });
});
