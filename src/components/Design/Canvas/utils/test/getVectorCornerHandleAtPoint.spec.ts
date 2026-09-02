// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorCornerHandleAtPoint } from '../getVectorCornerHandleAtPoint';

const buildNode = (vertices: Record<string, TVectorVertex>, segments: Record<string, TVectorSegment>): TVectorNode => ({
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
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
  it('should return the vertex id when a corner vertex is hit', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorCornerHandleAtPoint({ x: 1, y: 0 }, node, 5);

    // result
    expect(hit).toEqual({ vertexId: 'v1' });
  });

  it('should return the nearest vertex when more than one is within tolerance', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 4, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorCornerHandleAtPoint({ x: 3, y: 0 }, node, 5);

    // result
    expect(hit).toEqual({ vertexId: 'v2' });
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

  it('should return the vertex id even when it has no connected segment', () => {
    // mock — an isolated vertex; whether that's still a valid corner-handle hit is now the caller's call
    const node = buildNode({ v1: { id: 'v1', x: 0, y: 0 } }, {});

    // action
    const hit = getVectorCornerHandleAtPoint({ x: 0, y: 0 }, node, 5);

    // result
    expect(hit).toEqual({ vertexId: 'v1' });
  });
});
