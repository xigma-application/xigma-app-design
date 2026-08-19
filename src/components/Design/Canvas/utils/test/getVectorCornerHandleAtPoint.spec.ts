// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorCornerHandleAtPoint } from '../getVectorCornerHandleAtPoint';

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

describe('getVectorCornerHandleAtPoint', () => {
  it('should return the touching segment end when a corner vertex with one connected segment is hit', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorCornerHandleAtPoint({ x: 1, y: 0 }, node, 5);

    // result
    expect(hit).toEqual({ end: 'start', segmentId: 's1', vertexId: 'v1' });
  });

  it('should return the segment end that still lacks a tangent when the vertex already has a handle on one side', () => {
    // mock — v1 already has a start handle on s1, so the corner pull should target s2's still-empty end
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: -100, y: 0 } },
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } },
        s2: { endId: 'v1', id: 's2', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
    );

    // action
    const hit = getVectorCornerHandleAtPoint({ x: 0, y: 0 }, node, 5);

    // result
    expect(hit).toEqual({ end: 'end', segmentId: 's2', vertexId: 'v1' });
  });

  it('should return the nearest vertex when more than one is within tolerance', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 4, y: 0 } },
      {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
      },
    );

    // action
    const hit = getVectorCornerHandleAtPoint({ x: 3, y: 0 }, node, 5);

    // result
    expect(hit).toEqual({ end: 'end', segmentId: 's1', vertexId: 'v2' });
  });

  it('should return null when no vertex is within tolerance', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorCornerHandleAtPoint({ x: 900, y: 900 }, node, 5);

    // result
    expect(hit).toBeNull();
  });

  it('should return null when the nearest vertex has no connected segment', () => {
    // mock
    const node = buildNode({ v1: { id: 'v1', x: 0, y: 0 } }, {});

    // action
    const hit = getVectorCornerHandleAtPoint({ x: 0, y: 0 }, node, 5);

    // result
    expect(hit).toBeNull();
  });
});
