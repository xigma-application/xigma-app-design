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

  it('should lean toward the segment\'s own tangentStart direction, an offset relative to "from", when walking forward', () => {
    // mock — tangent points straight up instead of toward b
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: { x: 0, y: -100 } };

    // result — close to straight up (-90deg), not exact: the angle samples a real point a short way
    // along the curve rather than the raw t=0 tangent (see the function's own comment for why), so it
    // leans toward wherever the curve is actually heading, here still dominated by the tangent
    expect(getVectorHalfEdgeAngle(segment, a, b)).toBeCloseTo(-Math.PI / 2, 0);
  });

  it('should lean toward tangentEnd (still an offset relative to "from") when walking the segment in reverse', () => {
    // mock — walking from b back to a; tangentEnd is the offset at b, tangentStart is irrelevant here
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: { x: 0, y: 100 }, tangentStart: { x: 0, y: -100 } };

    // result
    expect(getVectorHalfEdgeAngle(segment, b, a)).toBeCloseTo(Math.PI / 2, 0);
  });

  it('should return the exact straight-line angle when both ends have no tangent, even walking in reverse', () => {
    // mock
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };

    // result
    expect(getVectorHalfEdgeAngle(segment, b, a)).toBeCloseTo(Math.PI);
  });
});
