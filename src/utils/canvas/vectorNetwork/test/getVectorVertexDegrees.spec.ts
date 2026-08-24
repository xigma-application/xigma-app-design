// types
import { TVectorSegment } from 'types/design/types';

// utils
import { getVectorVertexDegrees } from '../getVectorVertexDegrees';

describe('getVectorVertexDegrees', () => {
  it('should count how many segment-ends touch each vertex', () => {
    // mock — a-b-c chain
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
    };

    // before
    const degrees = getVectorVertexDegrees(segments);

    // result
    expect(degrees.get('a')).toBe(1);
    expect(degrees.get('b')).toBe(2);
    expect(degrees.get('c')).toBe(1);
  });

  it('should return an empty map for an empty segment set', () => {
    // before
    const degrees = getVectorVertexDegrees({});

    // result
    expect(degrees.size).toBe(0);
  });
});
