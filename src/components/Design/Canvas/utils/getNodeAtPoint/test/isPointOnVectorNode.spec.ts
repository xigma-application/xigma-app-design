// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { isPointOnVectorNode } from '../isPointOnVectorNode';

const IDENTITY_LINE_TOLERANCE = 4;

const buildVector = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: '#ff0000',
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
    s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
    s3: { endId: 'v1', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 40, y: 0 }, v3: { id: 'v3', x: 20, y: 40 } },
  ...overrides,
});

describe('isPointOnVectorNode', () => {
  it('should return true for a point near the stroke even when no face is filled', () => {
    // mock
    const vector = buildVector({ filledFaceKeys: [] });

    // result — directly on the v1->v2 edge
    expect(isPointOnVectorNode({ x: 20, y: 0 }, vector, IDENTITY_LINE_TOLERANCE, new Set())).toBe(true);
  });

  it('should return false for a point far from the shape', () => {
    // mock
    const vector = buildVector({ filledFaceKeys: [] });

    // result
    expect(isPointOnVectorNode({ x: 9000, y: 9000 }, vector, IDENTITY_LINE_TOLERANCE, new Set())).toBe(false);
  });

  it('should return false when the vector is currently bound as a text-on-path guide, even on a direct hit', () => {
    // mock
    const vector = buildVector({ filledFaceKeys: [] });

    // result — same point that hits above, but the vector is now excluded
    expect(isPointOnVectorNode({ x: 20, y: 0 }, vector, IDENTITY_LINE_TOLERANCE, new Set(['vector-1']))).toBe(false);
  });

  it('should hit-test a rotated vector against its baked (rotated) geometry, not its raw segments', () => {
    // mock — a 20x10 rect rotated 90deg around its own center (10, 5); once baked, its edges span
    // x:5..15 / y:-5..15, so a click at (15, 5) lands on the (now-vertical) rotated east edge
    const vector = buildVector({
      rotation: 90,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      },
      vertices: {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 20, y: 0 },
        v3: { id: 'v3', x: 20, y: 10 },
        v4: { id: 'v4', x: 0, y: 10 },
      },
    });

    // result
    expect(isPointOnVectorNode({ x: 15, y: 5 }, vector, IDENTITY_LINE_TOLERANCE, new Set())).toBe(true);
    expect(isPointOnVectorNode({ x: 0, y: 0 }, vector, IDENTITY_LINE_TOLERANCE, new Set())).toBe(false);
  });
});
