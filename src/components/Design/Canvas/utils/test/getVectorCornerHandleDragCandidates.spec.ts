// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorCornerHandleDragCandidates } from '../getVectorCornerHandleDragCandidates';

const buildNode = (vertices: Record<string, TVectorVertex>, segments: Record<string, TVectorSegment>): TVectorNode => ({
  fillColor: '#000000',
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

describe('getVectorCornerHandleDragCandidates', () => {
  it('should report each touching segment’s own direction away from the vertex, with the end that touches it', () => {
    // mock — a "+" branch: v1 is shared by 4 segments, each starting at v1 and pointing outward
    const node = buildNode(
      {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 100, y: 0 },
        v3: { id: 'v3', x: 0, y: 100 },
        v4: { id: 'v4', x: -100, y: 0 },
        v5: { id: 'v5', x: 0, y: -100 },
      },
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v1', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v1', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v5', id: 's4', startId: 'v1', tangentEnd: null, tangentStart: null },
      },
    );
    const touchingSegments = Object.values(node.segments);

    // action
    const candidates = getVectorCornerHandleDragCandidates(touchingSegments, 'v1', node);

    // result — right/down/left/up
    expect(candidates).toEqual([
      { angle: 0, end: 'start', segmentId: 's1' },
      { angle: 90, end: 'start', segmentId: 's2' },
      { angle: 180, end: 'start', segmentId: 's3' },
      { angle: -90, end: 'start', segmentId: 's4' },
    ]);
  });

  it('should report "end" when the touched vertex is the segment’s own endId rather than startId', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
      { s1: { endId: 'v1', id: 's1', startId: 'v2', tangentEnd: null, tangentStart: null } },
    );

    // action
    const candidates = getVectorCornerHandleDragCandidates([node.segments.s1], 'v1', node);

    // result — v1 is s1's endId here (not startId); the reported direction is still away from v1, toward
    // its other endpoint v2 (0°, "right")
    expect(candidates).toEqual([{ angle: 0, end: 'end', segmentId: 's1' }]);
  });
});
