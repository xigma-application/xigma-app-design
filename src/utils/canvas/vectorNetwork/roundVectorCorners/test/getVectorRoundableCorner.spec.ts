// utils
import { getVectorRoundableCorner } from '../getVectorRoundableCorner';

const vertices = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 }, c: { id: 'c', x: 0, y: 10 } };
const straight = (
  id: string,
  startId: string,
  endId: string,
): { endId: string; id: string; startId: string; tangentEnd: null; tangentStart: null } => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

describe('getVectorRoundableCorner', () => {
  it('should find the two straight segments meeting at a vertex and their far ends', () => {
    // mock
    const segments = { s1: straight('s1', 'a', 'b'), s2: straight('s2', 'c', 'a') };

    // result
    expect(getVectorRoundableCorner({ segments, vertices }, 'a', ['s1', 's2'])).toEqual({
      first: segments.s1,
      firstEnd: vertices.b,
      second: segments.s2,
      secondEnd: vertices.c,
    });
  });

  it('should find the far ends whichever way the segments run', () => {
    // mock
    const segments = { s1: straight('s1', 'b', 'a'), s2: straight('s2', 'a', 'c') };

    // result
    expect(getVectorRoundableCorner({ segments, vertices }, 'a', ['s1', 's2'])).toMatchObject({
      firstEnd: vertices.b,
      secondEnd: vertices.c,
    });
  });

  it('should skip an end point, a junction, a curve and two segments back to the same vertex', () => {
    // mock
    const segments = {
      back: straight('back', 'b', 'a'),
      curve: { ...straight('curve', 'a', 'c'), tangentStart: { x: 1, y: 1 } },
      s1: straight('s1', 'a', 'b'),
      s2: straight('s2', 'c', 'a'),
    };

    // result
    expect(getVectorRoundableCorner({ segments, vertices }, 'a', ['s1'])).toBeNull();
    expect(getVectorRoundableCorner({ segments, vertices }, 'a', ['s1', 's2', 'back'])).toBeNull();
    expect(getVectorRoundableCorner({ segments, vertices }, 'a', ['s1', 'curve'])).toBeNull();
    expect(getVectorRoundableCorner({ segments, vertices }, 'a', ['curve', 's1'])).toBeNull();
    expect(getVectorRoundableCorner({ segments, vertices }, 'a', ['s1', 'back'])).toBeNull();
  });
});
