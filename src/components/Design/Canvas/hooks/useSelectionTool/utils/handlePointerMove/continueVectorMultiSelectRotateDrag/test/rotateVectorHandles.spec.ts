// types
import { TVectorSegment } from 'types/design/types';

// utils
import { rotateVectorHandles } from '../rotateVectorHandles';

describe('rotateVectorHandles', () => {
  it('should rotate each handle origin around its vertex and write it to the matching tangent', () => {
    // mock
    const segments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } } as Record<string, TVectorSegment>;

    // before
    const result = rotateVectorHandles(segments, { 'end:s1': { x: 0, y: 5 }, 'start:s1': { x: 5, y: 0 } }, 90);

    // result
    expect(result.s1.tangentStart).toEqual({ x: 0, y: 5 });
    expect(result.s1.tangentEnd).toEqual({ x: -5, y: 0 });
    expect(segments.s1.tangentStart).toBeNull();
  });
});
