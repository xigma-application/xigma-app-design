// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { isPointNearVectorPath } from '../isPointNearVectorPath';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  fillColor: '#000',
  id: '1',
  name: 'Vector',
  parentId: null,
  segments,
  strokeColor: '#000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

describe('isPointNearVectorPath', () => {
  it('should return true for a point near a straight segment', () => {
    // mock
    const node = buildNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    );

    // result
    expect(isPointNearVectorPath({ x: 5, y: 0.5 }, node, 1)).toBe(true);
  });

  it('should return false for a point far from every segment', () => {
    // mock
    const node = buildNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    );

    // result
    expect(isPointNearVectorPath({ x: 5, y: 50 }, node, 1)).toBe(false);
  });

  it('should return true for a point near a curved segment’s flattened polyline', () => {
    // mock — a bowed curve from (0,0) to (20,0); its cubic-bezier midpoint works out to exactly (10, 7.5)
    // by hand (P0=(0,0) P1=(10,10) P2=(10,10) P3=(20,0), t=0.5 blend weights 0.125/0.375/0.375/0.125)
    const node = buildNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -10, y: 10 }, tangentStart: { x: 10, y: 10 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 20, y: 0 } },
    );

    // result — near the curve's bowed midpoint, which sits far from the straight chord between its endpoints
    expect(isPointNearVectorPath({ x: 10, y: 7.5 }, node, 1)).toBe(true);
  });
});
