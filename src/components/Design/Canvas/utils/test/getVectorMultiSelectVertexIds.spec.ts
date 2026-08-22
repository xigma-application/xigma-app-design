// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorMultiSelectVertexIds } from '../getVectorMultiSelectVertexIds';

const buildNode = (id: string, segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id,
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

describe('getVectorMultiSelectVertexIds', () => {
  it('should return just the selected vertex ids when no segments are selected', () => {
    // mock
    const node = buildNode('vector-1', {}, { v1: { id: 'v1', x: 0, y: 0 } });
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const vertexIds = getVectorMultiSelectVertexIds(nodes, ['vector-1'], ['v1'], []);

    // result
    expect(vertexIds).toEqual(['v1']);
  });

  it('should resolve a selected segment to its two endpoint vertex ids', () => {
    // mock
    const node = buildNode(
      'vector-1',
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const vertexIds = getVectorMultiSelectVertexIds(nodes, ['vector-1'], [], ['s1']);

    // result
    expect(vertexIds).toEqual(['v1', 'v2']);
  });

  it('should skip a selected segment id that does not resolve to any currently-open node', () => {
    // mock
    const node = buildNode('vector-1', {}, { v1: { id: 'v1', x: 0, y: 0 } });
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const vertexIds = getVectorMultiSelectVertexIds(nodes, ['vector-1'], ['v1'], ['missing-segment']);

    // result
    expect(vertexIds).toEqual(['v1']);
  });

  it('should dedupe a vertex that is both explicitly selected and reachable through a selected segment', () => {
    // mock
    const node = buildNode(
      'vector-1',
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const vertexIds = getVectorMultiSelectVertexIds(nodes, ['vector-1'], ['v1'], ['s1']);

    // result
    expect(vertexIds).toEqual(['v1', 'v2']);
  });

  it('should resolve vertices and segments owned by different open nodes', () => {
    // mock — a genuinely cross-node selection: v1 lives on node A, the segment lives on node B
    const nodeA = buildNode('vector-a', {}, { v1: { id: 'v1', x: 0, y: 0 } });
    const nodeB = buildNode(
      'vector-b',
      { s1: { endId: 'v3', id: 's1', startId: 'v2', tangentEnd: null, tangentStart: null } },
      { v2: { id: 'v2', x: 200, y: 200 }, v3: { id: 'v3', x: 260, y: 200 } },
    );
    const nodes: Record<string, TSceneNode> = { 'vector-a': nodeA, 'vector-b': nodeB };

    // before
    const vertexIds = getVectorMultiSelectVertexIds(nodes, ['vector-a', 'vector-b'], ['v1'], ['s1']);

    // result
    expect(vertexIds).toEqual(['v1', 'v2', 'v3']);
  });
});
