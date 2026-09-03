// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getBakedEditingNodes } from '../getBakedEditingNodes';

const vector = (id: string, rotation = 0): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id,
  name: 'Vector',
  parentId: null,
  rotation,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
});

const frame: TFrameNode = {
  fill: '#fff',
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  childIds: [], clipContent: true, type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
};

describe('getBakedEditingNodes', () => {
  it('should resolve each editing id to its vector node, skipping ids that are missing or not vectors', () => {
    const nodes: Record<string, TSceneNode> = { 'frame-1': frame, 'vector-1': vector('vector-1') };

    const result = getBakedEditingNodes(nodes, ['vector-1', 'frame-1', 'ghost']);

    expect(result.map((node) => node.id)).toEqual(['vector-1']);
    expect(result[0].vertices.v2).toEqual({ id: 'v2', x: 100, y: 0 });
  });

  it('should bake rotation out so vertices come back in world space', () => {
    const nodes: Record<string, TSceneNode> = { 'vector-1': vector('vector-1', 90) };

    const [baked] = getBakedEditingNodes(nodes, ['vector-1']);

    expect(baked.rotation).toBe(0);
    // a 90° turn about the segment's own centre (50,0) swaps the two vertices' offsets onto the y-axis
    expect(baked.vertices.v1.x).toBeCloseTo(50);
    expect(baked.vertices.v2.x).toBeCloseTo(50);
    expect(Math.abs(baked.vertices.v1.y - baked.vertices.v2.y)).toBeCloseTo(100);
  });
});
