// utils
import { getThickPolylineVertices } from '../getThickPolylineVertices';

describe('getThickPolylineVertices', () => {
  it('should produce a single quad (12 numbers) for a 2-point straight polyline', () => {
    // before
    const vertices = getThickPolylineVertices(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      1,
    );

    // result
    expect(vertices).toHaveLength(12);
  });

  it('should produce one quad per consecutive point pair, plus a join quad at the interior vertex, for a 3+ point polyline', () => {
    // before — 2 segment quads (12 numbers each) plus 1 join quad (12 numbers) at (10,0), where the
    // two segments meet at a right angle
    const vertices = getThickPolylineVertices(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      1,
    );

    // result
    expect(vertices).toHaveLength(36);
  });

  it('should fill the join wedge at an interior vertex with a sharp miter, not a flat bevel cut', () => {
    // before — same right-angle turn as above: segment 1 (0,0)->(10,0), segment 2 (10,0)->(10,10);
    // the outer edges of both segments extend to meet at (11,-1) — a proper sharp square corner,
    // exactly like Figma renders one, instead of a visibly flat-cut corner
    const vertices = getThickPolylineVertices(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      1,
    );

    // result — the last 12 numbers (the join quad) are appended after both segment quads
    const join = vertices.slice(-12);
    const expected = [10, 0, 10, -1, 11, -1, 10, 0, 11, -1, 11, 0];

    join.forEach((value, index) => expect(value).toBeCloseTo(expected[index]));
  });

  it('should skip a zero-length segment pair (two identical consecutive points) and contribute nothing for it, including no join around it', () => {
    // before — only the second (non-degenerate) pair contributes a quad; the join between the
    // degenerate first segment and the real second segment has no offset to join from, so it's skipped
    const vertices = getThickPolylineVertices(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      1,
    );

    // result
    expect(vertices).toHaveLength(12);
  });
});
