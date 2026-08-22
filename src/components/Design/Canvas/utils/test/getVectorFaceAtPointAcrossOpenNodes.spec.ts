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

  it('should return null when the open node id list is empty', () => {
    // mock
    const node = buildTriangleNode('n1', 0);
    const nodes: Record<string, TSceneNode> = { n1: node };

    // result
    expect(getVectorFaceAtPointAcrossOpenNodes({ x: 50, y: 40 }, [], nodes)).toBeNull();
  });
});
