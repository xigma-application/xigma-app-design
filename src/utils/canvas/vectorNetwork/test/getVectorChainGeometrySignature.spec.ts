// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorChainGeometrySignature } from '../getVectorChainGeometrySignature';

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: '#000',
  filledFaceKeys: [],
  id: '1',
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

describe('getVectorChainGeometrySignature', () => {
  it('should return the same signature for two calls against the same node identity', () => {
    // mock
    const node = buildNode();

    // result — the WeakMap cache hit path
    expect(getVectorChainGeometrySignature(node)).toBe(getVectorChainGeometrySignature(node));
  });

  it('should change when a vertex moves', () => {
    // mock
    const node = buildNode();
    const moved = buildNode({ vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 200, y: 0 } } });

    // result
    expect(getVectorChainGeometrySignature(node)).not.toBe(getVectorChainGeometrySignature(moved));
  });

  it('should change when a segment tangent changes', () => {
    // mock
    const node = buildNode();
    const curved = buildNode({
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: { x: 10, y: 10 } } },
    });

    // result
    expect(getVectorChainGeometrySignature(node)).not.toBe(getVectorChainGeometrySignature(curved));
  });

  it('should change when rotation changes', () => {
    // mock
    const node = buildNode();
    const rotated = buildNode({ rotation: 45 });

    // result
    expect(getVectorChainGeometrySignature(node)).not.toBe(getVectorChainGeometrySignature(rotated));
  });

  it('should be independent of a vertex/segment record insertion order', () => {
    // mock — same two segments, built in the opposite object-key order
    const node = buildNode({
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
      },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 100, y: 100 } },
    });
    // deliberately reversed insertion order vs. `node` above — the point of this test
    const reordered = buildNode({
      segments: {
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        // eslint-disable-next-line sort-keys -- s2-before-s1 insertion order is the point of this test
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      },
      // eslint-disable-next-line sort-keys -- c-before-b-before-a insertion order is the point of this test
      vertices: { c: { id: 'c', x: 100, y: 100 }, b: { id: 'b', x: 100, y: 0 }, a: { id: 'a', x: 0, y: 0 } },
    });

    // result
    expect(getVectorChainGeometrySignature(node)).toBe(getVectorChainGeometrySignature(reordered));
  });
});
