// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from '../bakeVectorNodeRotation';

const buildNode = (rotation: number): TVectorNode => ({
  fillColor: '#ff0000',
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {
    v1: { id: 'v1', x: 10, y: 10 },
    v2: { id: 'v2', x: 110, y: 10 },
    v3: { id: 'v3', x: 110, y: 110 },
    v4: { id: 'v4', x: 10, y: 110 },
  },
});

describe('bakeVectorNodeRotation', () => {
  it('should return the node vertices/segments unchanged when rotation is 0', () => {
    // mock
    const node = buildNode(0);

    // result
    expect(bakeVectorNodeRotation(node)).toEqual({ rotation: 0, segments: node.segments, vertices: node.vertices });
  });

  it('should rotate every vertex around the bounds center and reset rotation to 0', () => {
    // mock — a 100x100 square, 180deg around its own center (60, 60) maps each vertex to its
    // point-symmetric opposite
    const node = buildNode(180);

    // before
    const baked = bakeVectorNodeRotation(node);

    // result — tangents aren't rounded, so the near-zero x component is checked with a tolerance for
    // floating-point noise from Math.cos(180deg) not being an exact -1
    expect(baked.rotation).toBe(0);
    expect(baked.vertices).toEqual({
      v1: { id: 'v1', x: 110, y: 110 },
      v2: { id: 'v2', x: 10, y: 110 },
      v3: { id: 'v3', x: 10, y: 10 },
      v4: { id: 'v4', x: 110, y: 10 },
    });
    expect(baked.segments.s1.tangentStart?.x).toBeCloseTo(-5);
    expect(baked.segments.s1.tangentStart?.y).toBeCloseTo(0);
  });
});
