// types
import { TFlattenedVectorSegment } from '../../flattenVectorSegments';

// utils
import { getVertexDegrees } from '../getVertexDegrees';

describe('getVertexDegrees', () => {
  it('should count the segments touching every vertex', () => {
    // before
    const degrees = getVertexDegrees([
      { endId: 'b', startId: 'a' },
      { endId: 'c', startId: 'b' },
    ] as TFlattenedVectorSegment[]);

    // result
    expect([...degrees]).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 1],
    ]);
  });
});
