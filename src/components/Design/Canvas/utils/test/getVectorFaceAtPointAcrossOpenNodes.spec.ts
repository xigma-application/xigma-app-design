// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorFaceAtPointAcrossOpenNodes } from '../getVectorFaceAtPointAcrossOpenNodes';

const buildTriangleNode = (id: string, offsetX: number): TVectorNode => ({
  fillColor: '#000000',
  filledFaceKeys: [],
  id,
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
    s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
    s3: { endId: 'v1', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#ffffff',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {
    v1: { id: 'v1', x: offsetX, y: 0 },
    v2: { id: 'v2', x: offsetX + 100, y: 0 },
    v3: { id: 'v3', x: offsetX + 50, y: 100 },
  },
});

describe('getVectorFaceAtPointAcrossOpenNodes', () => {
  it('should return the hit face and its owning node when the point lands on the only open node', () => {
    // mock
    const node = buildTriangleNode('n1', 0);
    const nodes: Record<string, TSceneNode> = { n1: node };

    // result
    const hit = getVectorFaceAtPointAcrossOpenNodes({ x: 50, y: 40 }, ['n1'], nodes);

    expect(hit?.node.id).toBe('n1');
    expect(hit?.face.key).toBe('s1,s2,s3');
  });

  it('should check every open node until one hits, not just the first', () => {
    // mock — the point sits inside the second node's triangle, well outside the first's
    const nodeA = buildTriangleNode('n1', 0);
    const nodeB = buildTriangleNode('n2', 1000);
    const nodes: Record<string, TSceneNode> = { n1: nodeA, n2: nodeB };

    // result
    const hit = getVectorFaceAtPointAcrossOpenNodes({ x: 1050, y: 40 }, ['n1', 'n2'], nodes);

    expect(hit?.node.id).toBe('n2');
  });

  it('should return null when the point misses every open node', () => {
    // mock
    const node = buildTriangleNode('n1', 0);
    const nodes: Record<string, TSceneNode> = { n1: node };

    // result
    expect(getVectorFaceAtPointAcrossOpenNodes({ x: 500, y: 500 }, ['n1'], nodes)).toBeNull();
  });

  it('should skip a node id that isn’t a vector node, instead of throwing', () => {
    // mock — a non-vector node sits at the same id as the point, real vector node is elsewhere in the list
    const rectangleNode: TSceneNode = {
      fill: '#000000',
      height: 100,
      id: 'n1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 100,
      x: 0,
      y: 0,
    };
    const vectorNode = buildTriangleNode('n2', 0);
    const nodes: Record<string, TSceneNode> = { n1: rectangleNode, n2: vectorNode };

    // result
    const hit = getVectorFaceAtPointAcrossOpenNodes({ x: 50, y: 40 }, ['n1', 'n2'], nodes);

    expect(hit?.node.id).toBe('n2');
  });

  it('should bake a rotated node’s rotation into fresh geometry before hit-testing it', () => {
    // mock — a full 360° turn lands the triangle back where it started (within floating-point epsilon),
    // so the point still hits without needing new expected geometry, while still exercising the bake path
    const node: TVectorNode = { ...buildTriangleNode('n1', 0), rotation: 360 };
    const nodes: Record<string, TSceneNode> = { n1: node };

    // result
    const hit = getVectorFaceAtPointAcrossOpenNodes({ x: 50, y: 40 }, ['n1'], nodes);

    expect(hit?.node.id).toBe('n1');
  });

  it('should return null when the open node id list is empty', () => {
    // mock
    const node = buildTriangleNode('n1', 0);
    const nodes: Record<string, TSceneNode> = { n1: node };

    // result
    expect(getVectorFaceAtPointAcrossOpenNodes({ x: 50, y: 40 }, [], nodes)).toBeNull();
  });

  it('should return the smaller face from a different open node, even when it comes first in vectorEditingNodeIds and every one of its own faces also contains the point', () => {
    // mock — a 200x200 square (n1, listed first) and a fully separate 100x100 square (n2) sitting
    // entirely inside n1's own on-screen bounds — two different nodes overlapping on screen, unlike
    // getVectorFaceAtPoint.spec.ts's own single-node nested-loops case
    const bigSquare: TVectorNode = {
      fillColor: '#000000',
      filledFaceKeys: [],
      id: 'n1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#ffffff',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 200, y: 0 },
        v3: { id: 'v3', x: 200, y: 200 },
        v4: { id: 'v4', x: 0, y: 200 },
      },
    };
    const smallSquare: TVectorNode = {
      fillColor: '#000000',
      filledFaceKeys: [],
      id: 'n2',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#ffffff',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x: 50, y: 50 },
        v2: { id: 'v2', x: 150, y: 50 },
        v3: { id: 'v3', x: 150, y: 150 },
        v4: { id: 'v4', x: 50, y: 150 },
      },
    };
    // a third, medium 140x140 square (n3, listed last) also covers the point — bigger than n2's own
    // face, so checking it exercises the reduce's "candidate isn't smaller, keep the current smallest"
    // branch too, not just "found a new smallest" every time
    const mediumSquare: TVectorNode = {
      fillColor: '#000000',
      filledFaceKeys: [],
      id: 'n3',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#ffffff',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x: 30, y: 30 },
        v2: { id: 'v2', x: 170, y: 30 },
        v3: { id: 'v3', x: 170, y: 170 },
        v4: { id: 'v4', x: 30, y: 170 },
      },
    };
    const nodes: Record<string, TSceneNode> = { n1: bigSquare, n2: smallSquare, n3: mediumSquare };

    // result — (100,100) sits inside all 3 squares; n1 is listed first but n2's face is smallest
    const hit = getVectorFaceAtPointAcrossOpenNodes({ x: 100, y: 100 }, ['n1', 'n2', 'n3'], nodes);

    expect(hit?.node.id).toBe('n2');
  });
});
