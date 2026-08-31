// utils
import { getMiterPoint } from '../getMiterPoint';

describe('getMiterPoint', () => {
  it('uses a curve edge’s tangentEnd (reversed) as its outgoing direction at edge.end', () => {
    // prevEdge arrives at (0,0) travelling in direction (1,0): tangentEnd = control2 - end, so a
    // control point behind the end point in -x gives that outgoing direction once negated
    const prevEdge = { start: { x: -1, y: 0 }, end: { x: 0, y: 0 }, tangentStart: null, tangentEnd: { x: -1, y: 0 } };
    // nextEdge leaves (2, -2) travelling in direction (0,1) — straight up
    const nextEdge = { start: { x: 2, y: -2 }, end: { x: 3, y: -2 }, tangentStart: { x: 0, y: 1 }, tangentEnd: null };

    expect(getMiterPoint(prevEdge, nextEdge)).toEqual({ x: 2, y: 0 });
  });

  it('falls back to the endpoint-to-endpoint direction for a straight edge', () => {
    const prevEdge = { start: { x: -1, y: 0 }, end: { x: 0, y: 0 }, tangentStart: null, tangentEnd: null };
    const nextEdge = { start: { x: 2, y: -2 }, end: { x: 2, y: -1 }, tangentStart: null, tangentEnd: null };

    expect(getMiterPoint(prevEdge, nextEdge)).toEqual({ x: 2, y: 0 });
  });

  it('returns null when the two directions are parallel', () => {
    const prevEdge = { start: { x: -1, y: 0 }, end: { x: 0, y: 0 }, tangentStart: null, tangentEnd: null };
    const nextEdge = { start: { x: 2, y: -2 }, end: { x: 3, y: -2 }, tangentStart: null, tangentEnd: null };

    expect(getMiterPoint(prevEdge, nextEdge)).toBeNull();
  });
});
