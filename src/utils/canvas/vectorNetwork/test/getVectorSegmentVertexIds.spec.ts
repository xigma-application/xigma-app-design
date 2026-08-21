// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorSegmentVertexIds } from '../getVectorSegmentVertexIds';

const node: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
    s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 }, v3: { id: 'v3', x: 20, y: 0 } },
};

describe('getVectorSegmentVertexIds', () => {
  it('should return the deduplicated start/end vertex ids of every given segment', () => {
    // action
    const vertexIds = getVectorSegmentVertexIds(node, ['s1', 's2']);

    // result — v2 is shared by both segments and appears only once
    expect(vertexIds).toEqual(['v1', 'v2', 'v3']);
  });

  it('should return an empty array when no segment ids are given', () => {
    // action
    const vertexIds = getVectorSegmentVertexIds(node, []);

    // result
    expect(vertexIds).toEqual([]);
  });

  it('should skip a segment id that does not exist on the node', () => {
    // action
    const vertexIds = getVectorSegmentVertexIds(node, ['missing-segment']);

    // result
    expect(vertexIds).toEqual([]);
  });
});
