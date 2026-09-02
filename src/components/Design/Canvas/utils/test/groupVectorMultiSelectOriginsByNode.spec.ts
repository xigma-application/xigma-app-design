// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { groupVectorMultiSelectOriginsByNode } from '../groupVectorMultiSelectOriginsByNode';

const buildNode = (id: string, segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  defaultFill: null,
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

describe('groupVectorMultiSelectOriginsByNode', () => {
  it('should group vertex and handle origins under their single owning node', () => {
    // mock
    const node = buildNode(
      'vector-1',
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    );
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const groups = groupVectorMultiSelectOriginsByNode(
      nodes,
      ['vector-1'],
      { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 } },
      { 'start:s1': { x: 5, y: 0 } },
    );

    // result
    expect(groups).toEqual({ 'vector-1': { handleKeys: ['start:s1'], vertexIds: ['v1', 'v2'] } });
  });

  it('should split vertex and handle origins across two different owning nodes', () => {
    // mock — a genuinely cross-node drag: v1 lives on node A, the handle lives on node B
    const nodeA = buildNode('vector-a', {}, { v1: { id: 'v1', x: 0, y: 0 } });
    const nodeB = buildNode(
      'vector-b',
      { s1: { endId: 'v3', id: 's1', startId: 'v2', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
      { v2: { id: 'v2', x: 200, y: 200 }, v3: { id: 'v3', x: 260, y: 200 } },
    );
    const nodes: Record<string, TSceneNode> = { 'vector-a': nodeA, 'vector-b': nodeB };

    // before
    const groups = groupVectorMultiSelectOriginsByNode(
      nodes,
      ['vector-a', 'vector-b'],
      { v1: { x: 0, y: 0 } },
      { 'start:s1': { x: 5, y: 0 } },
    );

    // result
    expect(groups).toEqual({
      'vector-a': { handleKeys: [], vertexIds: ['v1'] },
      'vector-b': { handleKeys: ['start:s1'], vertexIds: [] },
    });
  });

  it('should skip a vertex origin that does not resolve to any currently-open node', () => {
    // mock
    const node = buildNode('vector-1', {}, { v1: { id: 'v1', x: 0, y: 0 } });
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const groups = groupVectorMultiSelectOriginsByNode(nodes, ['vector-1'], { 'missing-vertex': { x: 0, y: 0 } }, {});

    // result
    expect(groups).toEqual({});
  });

  it('should skip a handle origin whose segment does not resolve to any currently-open node', () => {
    // mock
    const node = buildNode('vector-1', {}, { v1: { id: 'v1', x: 0, y: 0 } });
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const groups = groupVectorMultiSelectOriginsByNode(nodes, ['vector-1'], {}, { 'start:missing-segment': { x: 0, y: 0 } });

    // result
    expect(groups).toEqual({});
  });

  it('should return an empty object when there are no origins at all', () => {
    // before
    const groups = groupVectorMultiSelectOriginsByNode({}, [], {}, {});

    // result
    expect(groups).toEqual({});
  });
});
