// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getAllVectorVertexPositions } from '../getAllVectorVertexPositions';

const buildVectorNode = (overrides: Partial<TVectorNode>): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('getAllVectorVertexPositions', () => {
  it('should return an empty array when there are no vector nodes on the scene', () => {
    // mock
    const nodes: Record<string, TSceneNode> = {
      'frame-1': {
        fill: '#ff0000',
        height: 10,
        id: 'frame-1',
        name: 'Frame',
        parentId: null,
        rotation: 0,
        childIds: [], clipContent: true, type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      },
    };

    // action
    const result = getAllVectorVertexPositions(nodes);

    // result
    expect(result).toEqual([]);
  });

  it('should collect vertex positions from every vector node on the scene, not just one', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { v1: { id: 'v1', x: 0, y: 0 } } });
    const nodeB = buildVectorNode({ id: 'b', vertices: { v2: { id: 'v2', x: 100, y: 50 } } });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // action
    const result = getAllVectorVertexPositions(nodes);

    // result
    expect(result).toEqual(
      expect.arrayContaining([
        { x: 0, y: 0 },
        { x: 100, y: 50 },
      ]),
    );
    expect(result).toHaveLength(2);
  });

  it('should exclude the given vertex id from the result', () => {
    // mock
    const node = buildVectorNode({ vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 50 } } });
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // action
    const result = getAllVectorVertexPositions(nodes, ['v1']);

    // result
    expect(result).toEqual([{ x: 100, y: 50 }]);
  });

  it('should exclude every given vertex id when several are dragged together as a group', () => {
    // mock
    const node = buildVectorNode({
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 50 }, v3: { id: 'v3', x: 200, y: 75 } },
    });
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // action
    const result = getAllVectorVertexPositions(nodes, ['v1', 'v2']);

    // result
    expect(result).toEqual([{ x: 200, y: 75 }]);
  });

  it('should apply the node’s own rotation, returning world-space (not raw local-space) positions', () => {
    // mock — v1(0,0)/v2(10,0), 90deg around the bounds-center (5,0): v1 -> (5,-5), v2 -> (5,5)
    const node = buildVectorNode({
      rotation: 90,
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // action
    const result = getAllVectorVertexPositions(nodes);

    // result
    expect(result[0].x).toBeCloseTo(5);
    expect(result[0].y).toBeCloseTo(-5);
    expect(result[1].x).toBeCloseTo(5);
    expect(result[1].y).toBeCloseTo(5);
  });
});
