// types
import { TFlattenedVectorSegment } from '../../flattenVectorSegments';

// utils
import { getAdjacency } from '../getAdjacency';

describe('getAdjacency', () => {
  it('should list the segments touching every vertex', () => {
    // mock
    const ab = { endId: 'b', startId: 'a' } as TFlattenedVectorSegment;
    const bc = { endId: 'c', startId: 'b' } as TFlattenedVectorSegment;

    // before
    const adjacency = getAdjacency([ab, bc]);

    // result
    expect(adjacency.get('a')).toEqual([ab]);
    expect(adjacency.get('b')).toEqual([ab, bc]);
    expect(adjacency.get('c')).toEqual([bc]);
  });
});
