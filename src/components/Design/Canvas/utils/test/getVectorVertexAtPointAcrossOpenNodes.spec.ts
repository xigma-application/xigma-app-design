// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorVertexAtPointAcrossOpenNodes } from '../getVectorVertexAtPointAcrossOpenNodes';

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

describe('getVectorVertexAtPointAcrossOpenNodes', () => {
  it('should return null when no node is open for editing', () => {
    // mock
    const node = buildVectorNode({ id: 'a', vertices: { v1: { id: 'v1', x: 0, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const hit = getVectorVertexAtPointAcrossOpenNodes({ x: 0, y: 0 }, [], nodes, 5);

    // result
    expect(hit).toBeNull();
  });

  it('should return null when the open node has no vertex within tolerance', () => {
    // mock
    const node = buildVectorNode({ id: 'a', vertices: { v1: { id: 'v1', x: 100, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const hit = getVectorVertexAtPointAcrossOpenNodes({ x: 0, y: 0 }, ['a'], nodes, 5);

    // result
    expect(hit).toBeNull();
  });

  it('should hit a vertex on the single open node', () => {
    // mock
    const node = buildVectorNode({ id: 'a', vertices: { v1: { id: 'v1', x: 1, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const hit = getVectorVertexAtPointAcrossOpenNodes({ x: 0, y: 0 }, ['a'], nodes, 5);

    // result
    expect(hit).toEqual({ node, vertexId: 'v1' });
  });

  it('should pick the closer vertex when two open nodes both hit', () => {
    // mock
    const nodeA = buildVectorNode({ id: 'a', vertices: { near: { id: 'near', x: 1, y: 0 } } });
    const nodeB = buildVectorNode({ id: 'b', vertices: { far: { id: 'far', x: 3, y: 0 } } });
    const nodes: Record<string, TSceneNode> = { a: nodeA, b: nodeB };

    // before
    const hit = getVectorVertexAtPointAcrossOpenNodes({ x: 0, y: 0 }, ['a', 'b'], nodes, 5);

    // result
    expect(hit).toEqual({ node: nodeA, vertexId: 'near' });
  });

  it('should exclude the given vertex id on whichever open node owns it', () => {
    // mock
    const node = buildVectorNode({
      id: 'a',
      vertices: { dragged: { id: 'dragged', x: 0, y: 0 }, near: { id: 'near', x: 1, y: 0 } },
    });
    const nodes: Record<string, TSceneNode> = { a: node };

    // before
    const hit = getVectorVertexAtPointAcrossOpenNodes({ x: 0, y: 0 }, ['a'], nodes, 5, 'dragged');

    // result
    expect(hit).toEqual({ node, vertexId: 'near' });
  });
});
