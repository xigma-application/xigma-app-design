// types
import { TVectorSegment } from 'types/design/types';

// utils
import { resizeVectorSegments } from '../resizeVectorSegments';

const segments: Record<string, TVectorSegment> = {
  s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 2, y: 3 } },
  s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: { x: -1, y: 4 }, tangentStart: null },
};

describe('resizeVectorSegments', () => {
  it('should scale each segment tangent independently per axis, keeping null tangents null and other fields intact', () => {
    // before
    const resized = resizeVectorSegments(segments, 2, 3);

    // result
    expect(resized).toEqual({
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 4, y: 9 } },
      s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: { x: -2, y: 12 }, tangentStart: null },
    });
  });
});
