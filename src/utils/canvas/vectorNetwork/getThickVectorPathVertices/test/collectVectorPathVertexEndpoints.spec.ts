// types
import { TFlattenedVectorSegment } from '../../flattenVectorSegments';

// utils
import { collectVectorPathVertexEndpoints } from '../collectVectorPathVertexEndpoints';

describe('collectVectorPathVertexEndpoints', () => {
  it('should record an outgoing endpoint at the start vertex and an incoming one at the end vertex', () => {
    // mock
    const segments: TFlattenedVectorSegment[] = [
      {
        endId: 'v2',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        segmentId: 's1',
        startId: 'v1',
      },
    ];

    // action
    const endpointsByVertexId = collectVectorPathVertexEndpoints(segments, 1);

    // result
    expect(endpointsByVertexId.get('v1')).toEqual([{ direction: 'outgoing', offset: { x: -0, y: 1 }, point: { x: 0, y: 0 } }]);
    expect(endpointsByVertexId.get('v2')).toEqual([{ direction: 'incoming', offset: { x: -0, y: 1 }, point: { x: 10, y: 0 } }]);
  });

  it('should accumulate multiple endpoints under the same shared vertex, in segment order', () => {
    // mock — two segments both starting from v1
    const segments: TFlattenedVectorSegment[] = [
      {
        endId: 'v2',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        segmentId: 's1',
        startId: 'v1',
      },
      {
        endId: 'v3',
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 10 },
        ],
        segmentId: 's2',
        startId: 'v1',
      },
    ];

    // action
    const endpointsByVertexId = collectVectorPathVertexEndpoints(segments, 1);

    // result
    expect(endpointsByVertexId.get('v1')).toEqual([
      { direction: 'outgoing', offset: { x: -0, y: 1 }, point: { x: 0, y: 0 } },
      { direction: 'outgoing', offset: { x: -1, y: 0 }, point: { x: 0, y: 0 } },
    ]);
  });

  it('should skip a degenerate zero-length endpoint (coincident start/end points) instead of recording a null offset', () => {
    // mock — a 3-point segment whose first two points coincide, so the start offset is undefined
    const segments: TFlattenedVectorSegment[] = [
      {
        endId: 'v2',
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        segmentId: 's1',
        startId: 'v1',
      },
    ];

    // action
    const endpointsByVertexId = collectVectorPathVertexEndpoints(segments, 1);

    // result
    expect(endpointsByVertexId.has('v1')).toBe(false);
    expect(endpointsByVertexId.get('v2')).toEqual([{ direction: 'incoming', offset: { x: -0, y: 1 }, point: { x: 10, y: 0 } }]);
  });
});
