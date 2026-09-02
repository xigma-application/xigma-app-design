// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorWidthLabelAnchor } from '../getVectorWidthLabelAnchor';

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
  ...overrides,
});

const point = { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 };

describe('getVectorWidthLabelAnchor', () => {
  it('should return null when the target node is not in the scene', () => {
    // before
    const result = getVectorWidthLabelAnchor({}, { nodeId: 'missing', point, side: 'right' });

    // result
    expect(result).toBeNull();
  });

  it('should return null when the node has no walkable chain', () => {
    // mock
    const node = buildNode({ segments: {} });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    // before
    const result = getVectorWidthLabelAnchor(nodes, { nodeId: node.id, point, side: 'right' });

    // result
    expect(result).toBeNull();
  });

  it('should anchor at the right handle, pointing away along the negated normal, for the right side', () => {
    // mock — a(0,0)->b(100,0), midpoint (50,0), normal (0,1); right handle = anchor - normal * rightOffset(6)
    const node = buildNode();
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    // before
    const result = getVectorWidthLabelAnchor(nodes, { nodeId: node.id, point, side: 'right' });

    // result
    expect(result).toEqual({ anchor: { x: 50, y: -6 }, direction: { x: 0, y: -1 }, segmentId: 's1', t: 0.5 });
  });

  it('should anchor at the left handle, pointing along the normal, for the left side', () => {
    // mock — left handle = anchor + normal * leftOffset(4)
    const node = buildNode();
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    // before
    const result = getVectorWidthLabelAnchor(nodes, { nodeId: node.id, point, side: 'left' });

    // result
    expect(result).toEqual({ anchor: { x: 50, y: 4 }, direction: { x: -0, y: 1 }, segmentId: 's1', t: 0.5 });
  });
});
