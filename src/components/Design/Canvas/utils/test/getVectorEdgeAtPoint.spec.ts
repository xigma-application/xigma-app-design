// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorEdgeAtPoint } from '../getVectorEdgeAtPoint';

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

describe('getVectorEdgeAtPoint', () => {
  it('should return the segment id when the point lies near the interior of a straight edge', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorEdgeAtPoint({ x: 5, y: 0.5 }, node, 2, 1);

    // result
    expect(hit).toEqual({ segmentId: 's1' });
  });

  it('should return null when the point is near the end vertex of an edge instead of its interior', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorEdgeAtPoint({ x: 9.5, y: 0 }, node, 2, 1);

    // result
    expect(hit).toBeNull();
  });

  it('should return null when the point is near the start vertex of an edge instead of its interior', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorEdgeAtPoint({ x: 0.5, y: 0 }, node, 2, 1);

    // result
    expect(hit).toBeNull();
  });

  it('should return null when the point is far from every edge and vertex', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorEdgeAtPoint({ x: 100, y: 100 }, node, 2, 1);

    // result
    expect(hit).toBeNull();
  });
});
