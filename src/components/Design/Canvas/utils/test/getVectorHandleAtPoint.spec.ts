// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorHandleAtPoint } from '../getVectorHandleAtPoint';

const buildNode = (vertices: Record<string, TVectorVertex>, segments: Record<string, TVectorSegment>): TVectorNode => ({
  fillColor: '#000000',
  id: '1',
  name: 'Vector',
  parentId: null,
  segments,
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

describe('getVectorHandleAtPoint', () => {
  it('should return the closer handle when both the start and end handles are within tolerance', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -6, y: 0 }, tangentStart: { x: 1, y: 0 } } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 0, y: 0 }, node, 5);

    // result
    expect(hit).toEqual({ distance: 1, end: 'start', segmentId: 's1', vertexId: 'v1' });
  });

  it('should return null when neither the start nor end tangent is set', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 0, y: 0 }, node, 5);

    // result
    expect(hit).toBeNull();
  });

  it('should return null when a handle exists but lies outside the tolerance', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 100, y: 0 } } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 0, y: 0 }, node, 5);

    // result
    expect(hit).toBeNull();
  });

  it('should return the start handle when only the start tangent is set', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 2, y: 0 } } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 2, y: 0 }, node, 1);

    // result
    expect(hit).toEqual({ distance: 0, end: 'start', segmentId: 's1', vertexId: 'v1' });
  });

  it('should return the end handle when only the end tangent is set', () => {
    // mock
    const node = buildNode(
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -2, y: 0 }, tangentStart: null } },
    );

    // action
    const hit = getVectorHandleAtPoint({ x: 8, y: 0 }, node, 1);

    // result
    expect(hit).toEqual({ distance: 0, end: 'end', segmentId: 's1', vertexId: 'v2' });
  });
});
