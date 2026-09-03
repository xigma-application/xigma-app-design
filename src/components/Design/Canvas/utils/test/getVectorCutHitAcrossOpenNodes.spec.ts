// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorCutHitAcrossOpenNodes } from '../getVectorCutHitAcrossOpenNodes';

const buildNode = (id: string, x: number): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id,
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x, y: 0 }, b: { id: 'b', x: x + 100, y: 0 } },
});

describe('getVectorCutHitAcrossOpenNodes', () => {
  it('should resolve a hit on whichever open node is closest to the click', () => {
    // mock — two open nodes, far apart
    const nodeA = buildNode('node-a', 0);
    const nodeB = buildNode('node-b', 1000);
    const nodes: Record<string, TSceneNode> = { 'node-a': nodeA, 'node-b': nodeB };

    // before
    const result = getVectorCutHitAcrossOpenNodes({ x: 1050, y: 0 }, ['node-a', 'node-b'], nodes, 5, 5);

    // result
    expect(result!.node.id).toBe('node-b');
    expect(result!.hit.segmentId).toBe('s1');
  });

  it('should pick the closer of two nodes when both register a real hit under the click', () => {
    // mock — node-a's segment runs along y=0, node-b's along y=7, both overlapping in x
    const nodeA = buildNode('node-a', 0); // a(0,0)-b(100,0)
    const nodeB: TVectorNode = { ...buildNode('node-b', 50), vertices: { a: { id: 'a', x: 50, y: 7 }, b: { id: 'b', x: 150, y: 7 } } };
    const nodes: Record<string, TSceneNode> = { 'node-a': nodeA, 'node-b': nodeB };

    // before — click at y=3 is 3px from node-a's line, 4px from node-b's — both within the 5px tolerance
    const result = getVectorCutHitAcrossOpenNodes({ x: 75, y: 3 }, ['node-b', 'node-a'], nodes, 5, 5);

    // result
    expect(result!.node.id).toBe('node-a');
  });

  it('should skip a non-vector node id and ignore a node with no hit under the click', () => {
    // mock — one vector node far from the click, one frame node
    const nodeA = buildNode('node-a', 0);
    const frameNode: TSceneNode = {
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
    };
    const nodes: Record<string, TSceneNode> = { 'frame-1': frameNode, 'node-a': nodeA };

    // before
    const result = getVectorCutHitAcrossOpenNodes({ x: 500, y: 500 }, ['node-a', 'frame-1'], nodes, 5, 5);

    // result
    expect(result).toBeNull();
  });

  it('should return null when no open node has a hit', () => {
    // mock
    const nodeA = buildNode('node-a', 0);
    const nodes: Record<string, TSceneNode> = { 'node-a': nodeA };

    // before
    const result = getVectorCutHitAcrossOpenNodes({ x: 5000, y: 5000 }, ['node-a'], nodes, 5, 5);

    // result
    expect(result).toBeNull();
  });
});
