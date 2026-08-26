// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getRenderedVectorNode } from '../getRenderedVectorNode';

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
  ...overrides,
});

describe('getRenderedVectorNode', () => {
  it('should pass an unrotated node’s own object reference straight through, unchanged', () => {
    // mock
    const node = buildNode();

    // before
    const result = getRenderedVectorNode(node);

    // result
    expect(result).toBe(node);
  });

  it('should bake a rotated node’s rotation into fresh segments/vertices, resetting its own rotation to 0', () => {
    // mock
    const node = buildNode({ rotation: 90 });

    // before
    const result = getRenderedVectorNode(node);

    // result
    expect(result).not.toBe(node);
    expect(result.rotation).toBe(0);
    expect(node.rotation).toBe(90);
  });

  it('should return the same cached rendered-node reference for the same rotated node reference instead of re-baking', () => {
    // mock
    const node = buildNode({ rotation: 90 });

    // before
    const first = getRenderedVectorNode(node);
    const second = getRenderedVectorNode(node);

    // result
    expect(second).toBe(first);
  });

  it('should re-bake a fresh result for a different node reference, even with identical content', () => {
    // mock
    const nodeA = buildNode({ rotation: 90 });
    const nodeB = buildNode({ rotation: 90 });

    // before
    const resultA = getRenderedVectorNode(nodeA);
    const resultB = getRenderedVectorNode(nodeB);

    // result
    expect(resultB).not.toBe(resultA);
    expect(resultB).toEqual(resultA);
  });
});
