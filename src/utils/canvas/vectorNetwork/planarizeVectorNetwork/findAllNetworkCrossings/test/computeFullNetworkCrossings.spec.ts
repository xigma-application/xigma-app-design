// utils
import { cacheSegments, crossSegments, crossVertices } from './crossingFixtures';
import { computeFullNetworkCrossings } from '../computeFullNetworkCrossings';

describe('computeFullNetworkCrossings', () => {
  it('should find the crossing of every overlapping segment pair', () => {
    // before
    const { crossings, segmentIdsByVertexId } = computeFullNetworkCrossings(
      crossSegments,
      crossVertices,
      cacheSegments(crossSegments, crossVertices),
    );

    // result
    expect(Object.keys(crossings.virtualVertices)).toEqual(['x:h:v:0.500000']);
    expect([...crossings.crossingsBySegmentId.keys()].sort()).toEqual(['h', 'v']);
    expect(segmentIdsByVertexId.get('x:h:v:0.500000')).toEqual(['h', 'v']);
  });

  it('should find nothing when no segments overlap', () => {
    // before
    const { crossings } = computeFullNetworkCrossings([crossSegments[2]], crossVertices, cacheSegments([crossSegments[2]], crossVertices));

    // result
    expect(crossings.crossingsBySegmentId.size).toBe(0);
  });
});
