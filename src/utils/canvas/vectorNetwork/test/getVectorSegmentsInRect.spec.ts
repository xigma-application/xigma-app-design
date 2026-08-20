// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorSegmentsInRect } from '../getVectorSegmentsInRect';

const buildNode = (segments: TVectorNode['segments']): TVectorNode => ({
  fillColor: null,
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
});

describe('getVectorSegmentsInRect', () => {
  it('should catch a straight segment via a rect over its own middle, even though flattening only samples its two endpoints', () => {
    // mock
    const node = buildNode({ s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } });

    // action — nowhere near either endpoint (0,0)/(100,0), but squarely over the segment's own bounding box
    const result = getVectorSegmentsInRect(node, { height: 10, width: 10, x: 45, y: -5 });

    // result
    expect(result).toEqual(['s1']);
  });

  it('should return an empty array when the rect misses the segment entirely', () => {
    // mock
    const node = buildNode({ s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } });

    // action
    const result = getVectorSegmentsInRect(node, { height: 10, width: 10, x: 45, y: 50 });

    // result
    expect(result).toEqual([]);
  });

  it('should catch a curved segment whose bounding box overlaps the rect', () => {
    // mock — a curve pulled toward (20,-50) by its start tangent; with only one control point off-axis,
    // the curve's actual peak deviation lands around (35, -22) (cubic Bezier at t=1/3), well short of the
    // control point itself
    const node = buildNode({
      s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 20, y: -50 } },
    });

    // action
    const result = getVectorSegmentsInRect(node, { height: 20, width: 30, x: 20, y: -25 });

    // result
    expect(result).toEqual(['s1']);
  });

  it('should return only the segments whose bounds actually overlap, given more than one segment', () => {
    // mock
    const node: TVectorNode = {
      ...buildNode({
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      }),
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 100, y: 500 } },
    };

    // action — over s1's span only
    const result = getVectorSegmentsInRect(node, { height: 10, width: 10, x: 45, y: -5 });

    // result
    expect(result).toEqual(['s1']);
  });
});
