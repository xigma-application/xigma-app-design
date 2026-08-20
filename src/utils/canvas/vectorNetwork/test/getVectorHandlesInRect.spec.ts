// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorHandlesInRect } from '../getVectorHandlesInRect';

const node: TVectorNode = {
  fillColor: null,
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
};

describe('getVectorHandlesInRect', () => {
  it('should return the start handle when only its position falls inside the rect', () => {
    // action — s1's tangentStart handle sits at (5, 0)
    const result = getVectorHandlesInRect(node, { height: 4, width: 4, x: 3, y: -2 });

    // result
    expect(result).toEqual([{ end: 'start', segmentId: 's1' }]);
  });

  it('should return the end handle when only its position falls inside the rect', () => {
    // action — s1's tangentEnd handle sits at (95, 0)
    const result = getVectorHandlesInRect(node, { height: 4, width: 4, x: 93, y: -2 });

    // result
    expect(result).toEqual([{ end: 'end', segmentId: 's1' }]);
  });

  it('should return both handles when a wide rect covers both', () => {
    // action
    const result = getVectorHandlesInRect(node, { height: 4, width: 100, x: 0, y: -2 });

    // result
    expect(result).toEqual([
      { end: 'start', segmentId: 's1' },
      { end: 'end', segmentId: 's1' },
    ]);
  });

  it('should return an empty array when the rect misses every handle', () => {
    // action
    const result = getVectorHandlesInRect(node, { height: 4, width: 4, x: 900, y: 900 });

    // result
    expect(result).toEqual([]);
  });

  it('should skip an end whose effective tangent is null (a straight segment has no handle position to hit)', () => {
    // mock
    const straightNode: TVectorNode = {
      ...node,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    };

    // action
    const result = getVectorHandlesInRect(straightNode, { height: 200, width: 200, x: -100, y: -100 });

    // result
    expect(result).toEqual([]);
  });
});
