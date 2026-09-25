// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { splitStraightSegmentAtVertices } from '../splitStraightSegmentAtVertices';

const vertices: Record<string, TVectorVertex> = {
  a: { id: 'a', x: 0, y: 0 },
  b: { id: 'b', x: 10, y: 0 },
  m1: { id: 'm1', x: 7, y: 0 },
  m2: { id: 'm2', x: 3, y: 0 },
  off: { id: 'off', x: 5, y: 5 },
};
const straight: TVectorSegment = { endId: 'b', id: 's', startId: 'a', tangentEnd: null, tangentStart: null };

describe('splitStraightSegmentAtVertices', () => {
  it('should split a straight segment at every vertex lying on it, in order along the segment', () => {
    // result
    expect(splitStraightSegmentAtVertices(straight, vertices, Object.values(vertices))).toEqual([
      { ...straight, endId: 'm2', id: 's-0', startId: 'a' },
      { ...straight, endId: 'm1', id: 's-1', startId: 'm2' },
      { ...straight, endId: 'b', id: 's-2', startId: 'm1' },
    ]);
  });

  it('should keep a straight segment with no vertex on it as is', () => {
    // result
    expect(splitStraightSegmentAtVertices(straight, vertices, [vertices.off])).toEqual([straight]);
  });

  it('should leave curved segments and segments with a missing end untouched', () => {
    // mock
    const curved = { ...straight, tangentStart: { x: 1, y: 1 } };
    const dangling = { ...straight, endId: 'missing' };

    // result
    expect(splitStraightSegmentAtVertices(curved, vertices, Object.values(vertices))).toEqual([curved]);
    expect(splitStraightSegmentAtVertices(dangling, vertices, Object.values(vertices))).toEqual([dangling]);
  });
});
