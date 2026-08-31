// utils
import { flattenEdgeLoop } from '../flattenEdgeLoop';

describe('flattenEdgeLoop', () => {
  it('should concatenate straight edges without duplicating shared endpoints', () => {
    // mock — a triangle
    const edges = [
      { end: { x: 10, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: null, tangentStart: null },
      { end: { x: 0, y: 10 }, start: { x: 10, y: 0 }, tangentEnd: null, tangentStart: null },
      { end: { x: 0, y: 0 }, start: { x: 0, y: 10 }, tangentEnd: null, tangentStart: null },
    ];

    // action
    const points = flattenEdgeLoop(edges);

    // result — one point per straight edge start, no duplicate joins, no closing duplicate
    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 10 },
    ]);
  });

  it('should sample multiple points along a curved edge', () => {
    // mock — one curved edge with a real tangent, forming a closed loop with itself via Z-style wrap
    const edges = [
      { end: { x: 10, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: { x: -5, y: 5 }, tangentStart: { x: 5, y: 5 } },
      { end: { x: 0, y: 0 }, start: { x: 10, y: 0 }, tangentEnd: null, tangentStart: null },
    ];

    // action
    const points = flattenEdgeLoop(edges);

    // result — the curved edge contributes more than just its two endpoints
    expect(points.length).toBeGreaterThan(3);
    expect(points[0]).toEqual({ x: 0, y: 0 });
  });
});
