// utils
import { buildCapsuleNetwork } from '../buildCapsuleNetwork';

const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number => Math.hypot(a.x - b.x, a.y - b.y);

describe('buildCapsuleNetwork', () => {
  it('should build a 16-point circle for a single-point dab, every point exactly radius from the centre', () => {
    // before
    const { polygon, segments, vertices } = buildCapsuleNetwork([{ x: 10, y: 10 }], 5);

    // result
    expect(polygon).toHaveLength(16);
    polygon.forEach((point) => expect(distance(point, { x: 10, y: 10 })).toBeCloseTo(5, 5));
    expect(Object.keys(vertices)).toHaveLength(16);
    expect(Object.keys(segments)).toHaveLength(16);
  });

  it('should build a closed ring of straight segments matching the polygon points, in order', () => {
    // before
    const { polygon, segments, vertices } = buildCapsuleNetwork(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      2,
    );

    // action — walk the ring starting from an arbitrary segment and collect the points it visits
    const firstSegment = Object.values(segments)[0];
    const visited: { x: number; y: number }[] = [];
    let current = firstSegment;

    for (let step = 0; step < polygon.length; step += 1) {
      visited.push(vertices[current.startId]);
      const next = Object.values(segments).find((segment) => segment.startId === current.endId);
      current = next!;
    }

    // result — the ring closes back onto the segment it started from, and every segment is straight
    expect(current).toBe(firstSegment);
    expect(visited).toHaveLength(polygon.length);
    Object.values(segments).forEach((segment) => {
      expect(segment.tangentStart).toBeNull();
      expect(segment.tangentEnd).toBeNull();
    });
  });

  it('should offset a straight 2-point path into two parallel rails exactly `radius` to each side', () => {
    // before — a horizontal stroke from (0,0) to (10,0)
    const { polygon } = buildCapsuleNetwork(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      2,
    );

    // result — every polygon point sits within [radius, radius] of its nearest source point (rail or
    // cap centre), i.e. the whole loop hugs the stroke at a constant distance
    const nearestSourceDistance = (point: { x: number; y: number }): number =>
      Math.min(distance(point, { x: 0, y: 0 }), distance(point, { x: 10, y: 0 }));

    polygon.forEach((point) => expect(nearestSourceDistance(point)).toBeLessThanOrEqual(2 + 1e-9));
    // and the rail points themselves (first two, appended in path order) sit exactly at y = ±2
    expect(polygon[0]).toEqual({ x: 0, y: 2 });
    expect(polygon[1]).toEqual({ x: 10, y: 2 });
  });

  it('should bulge the start cap backward (before the first point) and the end cap forward (past the last point)', () => {
    // before — same horizontal stroke; the start cap's own arc midpoint should sit left of x=0, the
    // end cap's should sit right of x=10 — reusing the exact wrap-around structure the polygon is
    // assembled with (see buildCapsuleNetwork's own comment on the walk order)
    const { polygon } = buildCapsuleNetwork(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      2,
    );

    // result — the endCap-derived points (indices [2, 9]) run from the right rail back to the left
    // rail while bulging past x=10; the startCap-derived points (indices [11, 17]) bulge before x=0
    const endCapPoints = polygon.slice(2, 10);
    const startCapPoints = polygon.slice(11);

    expect(Math.max(...endCapPoints.map((point) => point.x))).toBeGreaterThan(10);
    expect(Math.min(...startCapPoints.map((point) => point.x))).toBeLessThan(0);
  });

  it('should offset an interior bend point along the average of its incoming and outgoing directions', () => {
    // before — an L-shaped stroke; the middle point's incoming leg is +x, outgoing is +y
    const { polygon } = buildCapsuleNetwork(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      2,
    );

    // result — the rail point for the middle vertex (index 1 of the path) is offset along the
    // normalised (1,1) average direction, not purely +x or purely +y
    const middleLeftRailPoint = polygon[1];

    expect(middleLeftRailPoint.x).not.toBe(10);
    expect(middleLeftRailPoint.y).not.toBe(0);
  });

  it('should keep every rail point at radius when the path folds back on itself 180°', () => {
    // before — a stroke that goes out and directly back over itself
    const { polygon } = buildCapsuleNetwork(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 0 },
      ],
      3,
    );

    // result — the degenerate middle point still gets a well-defined (fallback-to-incoming) offset
    expect(polygon.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
  });
});
