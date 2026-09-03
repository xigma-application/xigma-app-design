// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getBakedVectorEditingNodes } from '../getBakedVectorEditingNodes';

const vectorNode: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
};

const frameNode = {
  childIds: [],
  clipContent: true,
  fill: '#ff0000',
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
} as TSceneNode;

describe('getBakedVectorEditingNodes', () => {
  it('should return every node untouched when no node is currently open for vector editing', () => {
    // mock
    const nodes: Record<string, TSceneNode> = { [frameNode.id]: frameNode, [vectorNode.id]: vectorNode };

    // before
    const result = getBakedVectorEditingNodes(nodes, []);

    // result
    expect(result).toEqual(nodes);
  });

  it('should pass an unrotated editing node’s own object reference straight through, unchanged', () => {
    // mock
    const nodes: Record<string, TSceneNode> = { [vectorNode.id]: vectorNode };

    // before
    const result = getBakedVectorEditingNodes(nodes, [vectorNode.id]);

    // result
    expect(result[vectorNode.id]).toBe(vectorNode);
  });

  it('should bake a rotated editing node’s rotation into fresh segments/vertices, leaving its rotation on the node reset to 0', () => {
    // mock
    const rotatedNode: TVectorNode = { ...vectorNode, rotation: 90 };
    const nodes: Record<string, TSceneNode> = { [rotatedNode.id]: rotatedNode };

    // before
    const result = getBakedVectorEditingNodes(nodes, [rotatedNode.id]);
    const baked = result[rotatedNode.id] as TVectorNode;

    // result
    expect(baked).not.toBe(rotatedNode);
    expect(baked.rotation).toBe(0);
    expect(baked.vertices).not.toBe(rotatedNode.vertices);
  });

  it('should leave the entry untouched when an editing node id no longer resolves to any node', () => {
    // mock
    const nodes: Record<string, TSceneNode> = { [vectorNode.id]: vectorNode };

    // before
    const result = getBakedVectorEditingNodes(nodes, ['missing-node']);

    // result
    expect(result).toEqual(nodes);
  });

  it('should leave the entry untouched when an editing node id resolves to a non-vector node', () => {
    // mock
    const nodes: Record<string, TSceneNode> = { [frameNode.id]: frameNode };

    // before
    const result = getBakedVectorEditingNodes(nodes, [frameNode.id]);

    // result
    expect(result[frameNode.id]).toBe(frameNode);
  });
});
