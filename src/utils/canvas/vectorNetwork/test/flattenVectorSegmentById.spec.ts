// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { flattenVectorSegmentById } from '../flattenVectorSegmentById';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({ endId, id, startId, tangentEnd: null, tangentStart: null });
const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });

const buildNode = (vertices: TVectorVertex[], segments: TVectorSegment[]): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: Object.fromEntries(segments.map((segment) => [segment.id, segment])),
  strokeColor: '#000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: Object.fromEntries(vertices.map((vert) => [vert.id, vert])),
});

describe('flattenVectorSegmentById', () => {
  it('should flatten just the requested segment', () => {
    // mock
    const node = buildNode([vertex('a', 0, 0), vertex('b', 10, 0)], [seg('ab', 'a', 'b')]);

    // before
    const flattened = flattenVectorSegmentById(node, 'ab');

    // result
    expect(flattened).toEqual({
      endId: 'b',
      points: [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 10, y: 0 },
      ],
      segmentId: 'ab',
      startId: 'a',
    });
  });

  it('should return null when the given segment id no longer exists on the node', () => {
    // mock
    const node = buildNode([vertex('a', 0, 0), vertex('b', 10, 0)], [seg('ab', 'a', 'b')]);

    // result
    expect(flattenVectorSegmentById(node, 'gone')).toBeNull();
  });

  it('should reuse the cached result on a second call with the same segment reference and unchanged endpoints', () => {
    // mock
    const node = buildNode([vertex('a', 0, 0), vertex('b', 10, 0)], [seg('ab', 'a', 'b')]);

    // before
    const first = flattenVectorSegmentById(node, 'ab');
    const second = flattenVectorSegmentById(node, 'ab');

    // result
    expect(second).toBe(first);
  });

  it('should recompute when an endpoint vertex moves to a new object, even though the segment object itself is unchanged', () => {
    // mock — same segment reference, but "b" now points at a different position
    const vertices = { a: vertex('a', 0, 0), b: vertex('b', 10, 0) };
    const segment = seg('ab', 'a', 'b');
    const node = buildNode(Object.values(vertices), [segment]);
    const movedNode: TVectorNode = { ...node, vertices: { ...node.vertices, b: vertex('b', 20, 0) } };

    // before
    const first = flattenVectorSegmentById(node, 'ab');
    const second = flattenVectorSegmentById(movedNode, 'ab');

    // result
    expect(second).not.toBe(first);
    expect(second!.points[1]).toEqual({ id: 'b', x: 20, y: 0 });
  });
});
