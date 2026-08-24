// utils
import { getCatmullRomTangents } from '../getCatmullRomTangents';

describe('getCatmullRomTangents', () => {
  it('should compute an interior tangent from the neighboring points, scaled by tension, when it does not exceed the shorter adjacent segment', () => {
    // mock — endpoints (index 0 and 2) are only constrained by their one real neighbor, so their raw
    // tangent survives unclamped; index 1's raw (next-previous)*tension has magnitude sqrt(125) ~= 11.18,
    // which exceeds its shorter adjacent segment (10, to the previous point), so it gets scaled down
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 10 },
    ];
    const tangents = getCatmullRomTangents(points, 0.5);

    // result
    expect(tangents[0]).toEqual({ x: 5, y: 0 });
    expect(tangents[1].x).toBeCloseTo(8.9443);
    expect(tangents[1].y).toBeCloseTo(4.4721);
    expect(tangents[2]).toEqual({ x: 5, y: 5 });
  });

  it('should treat a missing previous/next neighbor as the point itself, so an endpoint tangent is zero', () => {
    // mock — a single point has no neighbors on either side
    const points = [{ x: 3, y: 4 }];

    // result
    expect(getCatmullRomTangents(points, 0.5)).toEqual([{ x: 0, y: 0 }]);
  });

  it('should scale every tangent linearly with the tension parameter, as long as it stays under the clamp', () => {
    // mock — evenly spaced collinear points: index 1's raw tangent stays well under its 10px-long
    // adjacent segments at both tested tension values, so clamping never kicks in here
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
    ];

    // result
    expect(getCatmullRomTangents(points, 1 / 6)[1].x).toBeCloseTo(20 / 6);
    expect(getCatmullRomTangents(points, 1 / 3)[1].x).toBeCloseTo(20 / 3);
  });

  it('should clamp a tight loop tangent down to the shorter adjacent segment instead of overshooting past it', () => {
    // mock — the point sits in a tiny 2x2 loop, but its neighbors on the wider stroke are 100px away;
    // an unclamped tangent of (100-(-100))*0.5=100 would balloon the curve far outside the 2px loop
    const previous = { x: -100, y: 1 };
    const point = { x: 0, y: 0 };
    const next = { x: 100, y: -1 };
    const tangent = getCatmullRomTangents([previous, point, next], 0.5)[1];

    // result — clamped to the shorter adjacent segment (previous, ~100.005px), not the raw ~200px span
    expect(Math.hypot(tangent.x, tangent.y)).toBeCloseTo(Math.hypot(point.x - previous.x, point.y - previous.y));
  });

  it('should preserve the raw tangent direction while clamping its magnitude', () => {
    // mock — same lopsided-neighbor setup as the tight-loop case above, but purely horizontal so the
    // direction check is trivial: the clamped tangent must still point along +x, just shorter
    const points = [
      { x: -100, y: 0 },
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ];
    const tangent = getCatmullRomTangents(points, 0.5)[1];

    // result
    expect(tangent.y).toBe(0);
    expect(tangent.x).toBeGreaterThan(0);
    expect(tangent.x).toBeCloseTo(5);
  });
});
