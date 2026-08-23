// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorFacesInRectAcrossOpenNodes } from '../getVectorFacesInRectAcrossOpenNodes';

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

describe('getVectorFacesInRectAcrossOpenNodes', () => {
  it('should return the touched face grouped under its owning node', () => {
    // mock
    const node = buildTriangleNode('n1', 0);
    const nodes: Record<string, TSceneNode> = { n1: node };

    // result
    const hits = getVectorFacesInRectAcrossOpenNodes({ height: 200, width: 200, x: -50, y: -50 }, ['n1'], nodes);

    expect(hits).toHaveLength(1);
    expect(hits[0].node.id).toBe('n1');
    expect(hits[0].faces).toHaveLength(1);
  });

  it('should return an entry per open node the rect touches, across several disjoint nodes', () => {
    // mock — one rect spans both triangles at once
    const nodeA = buildTriangleNode('n1', 0);
    const nodeB = buildTriangleNode('n2', 1000);
    const nodes: Record<string, TSceneNode> = { n1: nodeA, n2: nodeB };

    // result
    const hits = getVectorFacesInRectAcrossOpenNodes({ height: 200, width: 1200, x: -50, y: -50 }, ['n1', 'n2'], nodes);

    expect(hits.map((hit) => hit.node.id).sort()).toEqual(['n1', 'n2']);
  });

  it('should omit a node the rect never touches', () => {
    // mock
    const node = buildTriangleNode('n1', 0);
    const nodes: Record<string, TSceneNode> = { n1: node };

    // result
    expect(getVectorFacesInRectAcrossOpenNodes({ height: 10, width: 10, x: 900, y: 900 }, ['n1'], nodes)).toEqual([]);
  });
});
