// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { evaluateCubicBezier } from '../evaluateCubicBezier';
import { refineCrossing } from '../refineCrossing';

describe('refineCrossing', () => {
  it('should converge on the exact crossing point of two straight segments, even from a deliberately imprecise initial guess', () => {
    // mock — true crossing is (50,0) at tA=tB=0.5; the initial guess is deliberately off-center
    const vertices: Record<string, TVectorVertex> = {
      a1: { id: 'a1', x: 0, y: 0 },
      a2: { id: 'a2', x: 100, y: 0 },
      b1: { id: 'b1', x: 50, y: -50 },
      b2: { id: 'b2', x: 50, y: 50 },
    };
    const segmentA: TVectorSegment = { endId: 'a2', id: 'sA', startId: 'a1', tangentEnd: null, tangentStart: null };
    const segmentB: TVectorSegment = { endId: 'b2', id: 'sB', startId: 'b1', tangentEnd: null, tangentStart: null };

    // before
    const result = refineCrossing(segmentA, segmentB, vertices, 0.4, 0.2, 0.4, 0.2);

    // result
    expect(result.tA).toBeCloseTo(0.5, 6);
    expect(result.tB).toBeCloseTo(0.5, 6);
    expect(result.point.x).toBeCloseTo(50, 6);
    expect(result.point.y).toBeCloseTo(0, 6);
  });

  it('should return a point that is self-consistent with the curve’s own position at the refined tA, for a genuinely curved crossing', () => {
    // mock — a curved segment crossing a straight one
    const vertices: Record<string, TVectorVertex> = {
      a1: { id: 'a1', x: 0, y: -50 },
      a2: { id: 'a2', x: 100, y: 50 },
      b1: { id: 'b1', x: 0, y: 0 },
      b2: { id: 'b2', x: 100, y: 0 },
    };
    const segmentA: TVectorSegment = {
      endId: 'a2',
      id: 'sA',
      startId: 'a1',
      tangentEnd: { x: -30, y: 0 },
      tangentStart: { x: 30, y: 0 },
    };
    const segmentB: TVectorSegment = { endId: 'b2', id: 'sB', startId: 'b1', tangentEnd: null, tangentStart: null };

    // before
    const result = refineCrossing(segmentA, segmentB, vertices, 0.5, 0.3, 0.5, 0.3);
    const expectedPoint = evaluateCubicBezier(vertices.a1, vertices.a2, segmentA.tangentStart, segmentA.tangentEnd, result.tA);

    // result — refined tA/tB land inside the valid (0,1) range, and the reported point matches the
    // curve's own position at that parameter
    expect(result.tA).toBeGreaterThan(0);
    expect(result.tA).toBeLessThan(1);
    expect(result.point.x).toBeCloseTo(expectedPoint.x, 5);
    expect(result.point.y).toBeCloseTo(expectedPoint.y, 5);
    // the crossing should land close to y=0, since that's where the straight segment B sits
    expect(result.point.y).toBeCloseTo(0, 1);
  });
});
