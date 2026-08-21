// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorVertexAtPointAcrossNodes } from '../getVectorVertexAtPointAcrossNodes';

const buildVectorNode = (overrides: Partial<TVectorNode>): TVectorNode => ({
  fillColor: null,
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

describe('getVectorVertexAtPointAcrossNodes', () => {
  it('should return null when no vertex on any node is within tolerance', () => {
    // mock
    const node = buildVectorNode({ vertices: { v1: { id: 'v1', x: 100, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const hit = getVectorVertexAtPointAcrossNodes({ x: 0, y: 0 }, nodes, 5, 'other');

    // result
    expect(hit).toBeNull();
  });

  it('should find the nearest vertex within the same node, excluding the dragged vertex itself', () => {
    // mock
    const node = buildVectorNode({
      vertices: { dragged: { id: 'dragged', x: 0, y: 0 }, near: { id: 'near', x: 1, y: 0 }, next: { id: 'next', x: 3, y: 0 } },
    });
    const nodes: Record<string, TSceneNode> = { 'vector-1': node };

    // before
    const hit = getVectorVertexAtPointAcrossNodes({ x: 0, y: 0 }, nodes, 5, 'dragged');

    // result
    expect(hit).toEqual({ nodeId: 'vector-1', point: { x: 1, y: 0 }, vertexId: 'near' });
  });

  it('should find a vertex belonging to a completely different node', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { dragged: { id: 'dragged', x: 0, y: 0 } } });
    const nodeB = buildVectorNode({ id: 'b', vertices: { target: { id: 'target', x: 2, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const hit = getVectorVertexAtPointAcrossNodes({ x: 0, y: 0 }, nodes, 5, 'dragged');

    // result
    expect(hit).toEqual({ nodeId: 'b', point: { x: 2, y: 0 }, vertexId: 'target' });
  });

  it('should resolve the hit against the target node’s baked, world-space position, not its raw rotated local coordinates', () => {
    // mock — target(10,0) rotated 90deg around bounds-center (5,0) lands at world (5,5)
    const nodeA = buildVectorNode({ id: 'a', vertices: { dragged: { id: 'dragged', x: 5, y: 5 } } });
    const nodeB = buildVectorNode({
      id: 'b',
      rotation: 90,
      vertices: { origin: { id: 'origin', x: 0, y: 0 }, target: { id: 'target', x: 10, y: 0 } },
    });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const hit = getVectorVertexAtPointAcrossNodes({ x: 5, y: 5 }, nodes, 1, 'dragged');

    // result
    expect(hit?.nodeId).toBe('b');
    expect(hit?.vertexId).toBe('target');
    expect(hit?.point.x).toBeCloseTo(5);
    expect(hit?.point.y).toBeCloseTo(5);
  });
});
