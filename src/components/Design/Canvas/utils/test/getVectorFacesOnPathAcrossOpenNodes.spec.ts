// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorFacesOnPathAcrossOpenNodes } from '../getVectorFacesOnPathAcrossOpenNodes';

const buildTriangleNode = (id: string, offsetX: number): TVectorNode => ({
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
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

describe('getVectorFacesOnPathAcrossOpenNodes', () => {
  it('should return the touched face grouped under its owning node', () => {
    // mock
    const node = buildTriangleNode('n1', 0);
    const nodes: Record<string, TSceneNode> = { n1: node };

    // result
    const hits = getVectorFacesOnPathAcrossOpenNodes([{ x: 50, y: 40 }], ['n1'], nodes);

    expect(hits).toHaveLength(1);
    expect(hits[0].node.id).toBe('n1');
    expect(hits[0].faces).toHaveLength(1);
  });

  it('should return an entry per open node the path touches, across several disjoint nodes', () => {
    // mock — one path point lands inside each of two separate triangles
    const nodeA = buildTriangleNode('n1', 0);
    const nodeB = buildTriangleNode('n2', 1000);
    const nodes: Record<string, TSceneNode> = { n1: nodeA, n2: nodeB };

    // result
    const hits = getVectorFacesOnPathAcrossOpenNodes(
      [
        { x: 50, y: 40 },
        { x: 1050, y: 40 },
      ],
      ['n1', 'n2'],
      nodes,
    );

    expect(hits.map((hit) => hit.node.id).sort()).toEqual(['n1', 'n2']);
  });

  it('should omit a node the path never touches', () => {
    // mock
    const node = buildTriangleNode('n1', 0);
    const nodes: Record<string, TSceneNode> = { n1: node };

    // result
    expect(getVectorFacesOnPathAcrossOpenNodes([{ x: 900, y: 900 }], ['n1'], nodes)).toEqual([]);
  });

  it('should bake a rotated node’s rotation into fresh geometry before checking it against the path', () => {
    // mock — a full 360° turn lands the triangle back where it started (within floating-point epsilon),
    // so the path still touches it without needing new expected geometry, while still exercising the bake path
    const node: TVectorNode = { ...buildTriangleNode('n1', 0), rotation: 360 };
    const nodes: Record<string, TSceneNode> = { n1: node };

    // result
    const hits = getVectorFacesOnPathAcrossOpenNodes([{ x: 50, y: 40 }], ['n1'], nodes);

    expect(hits).toHaveLength(1);
    expect(hits[0].node.id).toBe('n1');
  });
});
