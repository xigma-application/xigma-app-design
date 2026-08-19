// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { splitVectorSegment } from '../splitVectorSegment';

const node: TVectorNode = {
  fillColor: null,
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
};

describe('splitVectorSegment', () => {
  it('should insert a new vertex at the given point and split the segment into two around it', () => {
    // before
    const { newVertexId, segments, vertices } = splitVectorSegment(node, 's1', { x: 50, y: 0 });

    // result
    expect(newVertexId).not.toBe('v1');
    expect(newVertexId).not.toBe('v2');
    expect(segments.s1).toEqual({ endId: newVertexId, id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null });
    expect(Object.keys(segments)).toHaveLength(2);

    const newSegmentId = Object.keys(segments).find((id) => id !== 's1') as string;

    expect(segments[newSegmentId]).toEqual({ endId: 'v2', id: newSegmentId, startId: newVertexId, tangentEnd: null, tangentStart: null });
    expect(vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 0 });
  });

  it('should round the split point to whole pixels', () => {
    // before
    const { newVertexId, vertices } = splitVectorSegment(node, 's1', { x: 50.4, y: 0.6 });

    // result
    expect(vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 1 });
  });

  it('should carry the original segment tangents onto the correct half of the split', () => {
    // mock — a curved segment with both tangents set
    const curvedNode: TVectorNode = {
      ...node,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } } },
    };

    // before
    const { newVertexId, segments } = splitVectorSegment(curvedNode, 's1', { x: 50, y: 0 });
    const newSegmentId = Object.keys(segments).find((id) => id !== 's1') as string;

    // result — the first half keeps the original tangentStart, the second half keeps the original tangentEnd
    expect(segments.s1).toMatchObject({ tangentEnd: null, tangentStart: { x: 5, y: 0 } });
    expect(segments[newSegmentId]).toMatchObject({ tangentEnd: { x: -5, y: 0 }, tangentStart: null });
    expect(segments[newSegmentId].startId).toBe(newVertexId);
  });
});
