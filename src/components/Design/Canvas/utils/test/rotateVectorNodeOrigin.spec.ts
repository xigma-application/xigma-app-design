// types
import { TVectorNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { rotateVectorNodeOrigin } from '../rotateVectorNodeOrigin';

describe('rotateVectorNodeOrigin', () => {
  it('should rotate vertices around the given pivot', () => {
    // mock
    const origin: TVectorNodeOrigin = { segments: {}, vertices: { v1: { x: 15, y: 10 } } };

    // before
    const rotated = rotateVectorNodeOrigin(origin, { x: 10, y: 10 }, 90);

    // result
    expect(rotated.vertices).toEqual({ v1: { id: 'v1', x: 10, y: 15 } });
  });

  it('should rotate tangents as free vectors around the origin (0,0), not around the group pivot', () => {
    // mock — a tangent offset far from the pivot; if it were (wrongly) rotated around the pivot the
    // result would differ from rotating it around (0,0)
    const origin: TVectorNodeOrigin = {
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
      vertices: {},
    };

    // before
    const rotated = rotateVectorNodeOrigin(origin, { x: 100, y: 100 }, 90);

    // result — rotatePoint's convention rotates (5,0) around (0,0) by 90deg to (0,5), regardless of the
    // (100,100) pivot passed in for the vertices; tangents aren't rounded, so the x component is checked
    // with a tolerance for floating-point noise from Math.cos(90deg) not being an exact 0
    expect(rotated.segments.s1.tangentStart?.x).toBeCloseTo(0);
    expect(rotated.segments.s1.tangentStart?.y).toBeCloseTo(5);
    expect(rotated.segments.s1.tangentEnd).toBeNull();
  });
});
