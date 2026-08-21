// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorPointsInRect } from '../getVectorPointsInRect';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
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

describe('getVectorPointsInRect', () => {
  it('should return every vertex whose point falls inside the rect, and skip the ones outside', () => {
    // mock
    const node = buildNode({}, { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 50, y: 50 }, v3: { id: 'v3', x: 500, y: 500 } });

    // before
    const result = getVectorPointsInRect(node, { height: 100, width: 100, x: 0, y: 0 });

    // result
    expect(result.sort()).toEqual(['v1', 'v2']);
  });

  it('should not select a segment handle even when it falls inside the rect', () => {
    // mock — v1(0,0) -> v2(100,0), tangentEnd (0,-30) puts the "end" handle at (100,-30)
    const node = buildNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: 0, y: -30 }, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );

    // before — a rect that only covers the handle, not either vertex
    const result = getVectorPointsInRect(node, { height: 10, width: 10, x: 95, y: -35 });

    // result
    expect(result).toEqual([]);
  });

  it('should return everything empty for a node with no vertices or segments', () => {
    // mock
    const node = buildNode({}, {});

    // before
    const result = getVectorPointsInRect(node, { height: 100, width: 100, x: 0, y: 0 });

    // result
    expect(result).toEqual([]);
  });
});
