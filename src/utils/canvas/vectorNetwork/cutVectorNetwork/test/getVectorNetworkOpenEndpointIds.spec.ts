// types
import { TVectorSegment } from 'types/design/types';

// utils
import { getVectorNetworkOpenEndpointIds } from '../getVectorNetworkOpenEndpointIds';

describe('getVectorNetworkOpenEndpointIds', () => {
  it('should return the two degree-1 vertices of an open chain', () => {
    // mock — a-b-c chain, a and c are the open ends
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
    };

    // before
    const openEnds = getVectorNetworkOpenEndpointIds(segments);

    // result
    expect(openEnds.sort()).toEqual(['a', 'c']);
  });

  it('should return an empty array for an already-closed loop', () => {
    // mock — a-b-c-a triangle, every vertex has degree 2
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
      s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
    };

    // before
    const openEnds = getVectorNetworkOpenEndpointIds(segments);

    // result
    expect(openEnds).toEqual([]);
  });

  it('should return more than two open ends for a multi-contour or branching piece', () => {
    // mock — a "Y" shape: b is a 3-way branch, a/c/d are all degree-1
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
      s3: { endId: 'd', id: 's3', startId: 'b', tangentEnd: null, tangentStart: null },
    };

    // before
    const openEnds = getVectorNetworkOpenEndpointIds(segments);

    // result
    expect(openEnds.sort()).toEqual(['a', 'c', 'd']);
  });
});
