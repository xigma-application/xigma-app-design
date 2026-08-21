// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorHalfEdgeAngle } from '../getVectorHalfEdgeAngle';

const a: TVectorVertex = { id: 'a', x: 0, y: 0 };
const b: TVectorVertex = { id: 'b', x: 100, y: 0 };

describe('getVectorHalfEdgeAngle', () => {
  it('should return the straight-line angle toward "to" when the segment has no tangent at "from"', () => {
    // mock
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };

    // result
    expect(getVectorHalfEdgeAngle(segment, a, b)).toBeCloseTo(0);
  });

  it('should use the segment\'s own tangentStart, an offset relative to "from", when walking forward', () => {
    // mock — tangent points straight up instead of toward b
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: { x: 0, y: -100 } };

    // result
    expect(getVectorHalfEdgeAngle(segment, a, b)).toBeCloseTo(-Math.PI / 2);
  });

  it('should use tangentEnd (still an offset relative to "from") when walking the segment in reverse', () => {
    // mock — walking from b back to a; tangentEnd is the offset at b, tangentStart is irrelevant here
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: { x: 0, y: 100 }, tangentStart: { x: 0, y: -100 } };

    // result
    expect(getVectorHalfEdgeAngle(segment, b, a)).toBeCloseTo(Math.PI / 2);
  });
});
