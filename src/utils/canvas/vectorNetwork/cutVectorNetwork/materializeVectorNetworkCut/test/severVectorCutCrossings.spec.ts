// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { severVectorCutCrossings } from '../severVectorCutCrossings';

describe('severVectorCutCrossings', () => {
  it('should sever a single crossing into two disconnected segment fragments sharing no vertex', () => {
    // mock — segment a(0,0)->b(100,0), crossed at its midpoint by a vertical cut line
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segments: Record<string, TVectorSegment> = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const crossing = { lineT: 0.5, point: { x: 50, y: 0 }, segmentId: 's1', t: 0.5 };

    // before
    const result = severVectorCutCrossings(segments, vertices, [crossing], { x: 0, y: 1 });

    // result
    expect(result.sides).toHaveLength(1);
    expect('s1' in result.segments).toBe(false);

    const pieces = Object.values(result.segments);

    expect(pieces).toHaveLength(2);

    const startingAtA = pieces.find((piece) => piece.startId === 'a')!;
    const endingAtB = pieces.find((piece) => piece.endId === 'b')!;

    expect(startingAtA.endId).not.toBe(endingAtB.startId); // the two new points are never the same one
    expect(result.vertices[startingAtA.endId].x).toBeCloseTo(50);
    expect(result.vertices[endingAtB.startId].x).toBeCloseTo(50);
  });

  it('should keep the same side grouping (sideA/sideB) consistent across two crossings on differently-authored segments', () => {
    // mock — two parallel horizontal segments, one authored left-to-right, the other right-to-left,
    // both crossed by the same vertical cut line
    const vertices: Record<string, TVectorVertex> = {
      a1: { id: 'a1', x: 0, y: 0 },
      a2: { id: 'a2', x: 100, y: 0 },
      b1: { id: 'b1', x: 100, y: 100 },
      b2: { id: 'b2', x: 0, y: 100 },
    };
    const segments: Record<string, TVectorSegment> = {
      sA: { endId: 'a2', id: 'sA', startId: 'a1', tangentEnd: null, tangentStart: null }, // left -> right
      sB: { endId: 'b2', id: 'sB', startId: 'b1', tangentEnd: null, tangentStart: null }, // right -> left
    };
    const crossings = [
      { lineT: 0, point: { x: 50, y: 0 }, segmentId: 'sA', t: 0.5 },
      { lineT: 1, point: { x: 50, y: 100 }, segmentId: 'sB', t: 0.5 },
    ];

    // before — cut line pointing straight down (0,1)
    const result = severVectorCutCrossings(segments, vertices, crossings, { x: 0, y: 1 });

    // result — sideA/sideB grouping is by the CUT LINE's own direction, not each segment's own
    // authored start/end: a1 and b2 are both on the world's left side (x=0), and end up the same side
    // label, even though sA is authored left-to-right (a1 is its start) while sB is authored
    // right-to-left (b2 is its end) — the opposite ends of their own local parameterization
    const [crossingA, crossingB] = result.sides;
    const towardA1 = Object.values(result.segments).find((piece) => piece.startId === 'a1')!.endId;
    const towardB2 = Object.values(result.segments).find((piece) => piece.endId === 'b2')!.startId;

    const a1Side = towardA1 === crossingA.sideAId ? 'A' : 'B';
    const b2Side = towardB2 === crossingB.sideAId ? 'A' : 'B';

    expect(a1Side).toBe(b2Side);
  });
});
