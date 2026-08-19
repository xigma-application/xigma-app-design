// types
import { TVectorSegment } from 'types/design/types';

// utils
import { buildVectorHalfEdgeAdjacency } from '../buildVectorHalfEdgeAdjacency';

describe('buildVectorHalfEdgeAdjacency', () => {
  it('should add two directed half-edges per segment, one for each traversal direction, keyed by fromId', () => {
    // mock
    const segments: TVectorSegment[] = [{ endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null }];

    // before
    const adjacency = buildVectorHalfEdgeAdjacency(segments);

    // result
    expect(adjacency.get('a')).toEqual([{ segmentId: 's1', toId: 'b' }]);
    expect(adjacency.get('b')).toEqual([{ segmentId: 's1', toId: 'a' }]);
  });

  it('should accumulate half-edges from multiple segments sharing a vertex rather than overwriting them', () => {
    // mock
    const segments: TVectorSegment[] = [
      { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      { endId: 'c', id: 's2', startId: 'a', tangentEnd: null, tangentStart: null },
    ];

    // before
    const adjacency = buildVectorHalfEdgeAdjacency(segments);

    // result
    expect(adjacency.get('a')).toEqual([
      { segmentId: 's1', toId: 'b' },
      { segmentId: 's2', toId: 'c' },
    ]);
  });
});
