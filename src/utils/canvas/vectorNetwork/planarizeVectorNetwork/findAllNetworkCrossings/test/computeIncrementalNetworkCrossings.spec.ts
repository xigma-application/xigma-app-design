// types
import { TVectorSegment } from 'types/design/types';

// utils
import { cacheSegments, crossSegments, crossVertices, straightSegment } from './crossingFixtures';
import { computeFullNetworkCrossings } from '../computeFullNetworkCrossings';
import { computeIncrementalNetworkCrossings } from '../computeIncrementalNetworkCrossings';

const OLD_VERTEX_ID = 'x:h:v:0.500000';

const setup = (): ReturnType<typeof computeFullNetworkCrossings> & { segmentsById: Map<string, TVectorSegment> } => ({
  ...computeFullNetworkCrossings(crossSegments, crossVertices, cacheSegments(crossSegments, crossVertices)),
  segmentsById: new Map(crossSegments.map((segment) => [segment.id, segment])),
});

describe('computeIncrementalNetworkCrossings', () => {
  it('should drop the old crossing of a moved segment and find its new one', () => {
    // mock
    const { crossings, segmentIdsByVertexId, segmentsById } = setup();
    const vertices = { ...crossVertices, v1: { id: 'v1', x: 7, y: 0 }, v2: { id: 'v2', x: 7, y: 10 } };
    const moved = straightSegment('v', 'v1', 'v2');
    segmentsById.set('v', moved);

    // before
    const result = computeIncrementalNetworkCrossings(
      vertices,
      segmentsById,
      cacheSegments([...segmentsById.values()], vertices),
      ['v'],
      crossings,
      segmentIdsByVertexId,
    );

    // find
    const newVertexIds = Object.keys(result.crossings.virtualVertices);

    // result
    expect(newVertexIds).toEqual([OLD_VERTEX_ID]);
    expect(result.crossings.virtualVertices[OLD_VERTEX_ID]).toMatchObject({ x: 7, y: 5 });
    expect(result.crossings.crossingsBySegmentId.get('h')).toEqual([{ t: 0.7, vertexId: OLD_VERTEX_ID }]);
  });

  it('should keep the partner’s other crossings and look at each moved pair only once', () => {
    // mock
    const { crossings, segmentIdsByVertexId, segmentsById } = setup();
    crossings.crossingsBySegmentId.set('h', [...crossings.crossingsBySegmentId.get('h')!, { t: 0.9, vertexId: 'other' }]);
    crossings.crossingsBySegmentId.set('far', [{ t: 0.5, vertexId: 'other' }]);
    crossings.virtualVertices.other = { id: 'other', x: 0, y: 0 };
    segmentIdsByVertexId.set('other', ['h', 'far']);

    // before
    const result = computeIncrementalNetworkCrossings(
      crossVertices,
      segmentsById,
      cacheSegments(crossSegments, crossVertices),
      ['v', 'h'],
      crossings,
      segmentIdsByVertexId,
    );

    // result
    expect(Object.keys(result.crossings.virtualVertices)).toEqual([OLD_VERTEX_ID]);
    expect(result.crossings.crossingsBySegmentId.get('v')).toHaveLength(1);
    expect(result.crossings.crossingsBySegmentId.has('far')).toBe(false);
  });

  it('should leave everything as it was when a segment moves without crossings', () => {
    // mock
    const { crossings, segmentIdsByVertexId, segmentsById } = setup();

    // before
    const result = computeIncrementalNetworkCrossings(
      crossVertices,
      segmentsById,
      cacheSegments(crossSegments, crossVertices),
      ['far'],
      crossings,
      segmentIdsByVertexId,
    );

    // result
    expect(Object.keys(result.crossings.virtualVertices)).toEqual([OLD_VERTEX_ID]);
  });
});
