// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorFillLoopKeyAtPoint } from '../getVectorFillLoopKeyAtPoint';

const buildTriangleNode = (filledFaceKeys: string[]): TVectorNode => ({
  fillColor: '#000000',
  filledFaceKeys,
  id: '1',
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
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 50, y: 100 } },
});

const TRIANGLE_LOOP_KEY = 's1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]';

describe('getVectorFillLoopKeyAtPoint', () => {
  it('should return the loop key covering the given point', () => {
    // mock
    const node = buildTriangleNode([TRIANGLE_LOOP_KEY]);

    // result
    expect(getVectorFillLoopKeyAtPoint(node, { x: 50, y: 40 })).toBe(TRIANGLE_LOOP_KEY);
  });

  it('should return null when the point is outside every filled loop', () => {
    // mock
    const node = buildTriangleNode([TRIANGLE_LOOP_KEY]);

    // result
    expect(getVectorFillLoopKeyAtPoint(node, { x: 500, y: 500 })).toBeNull();
  });

  it('should return null when there are no filled loops at all', () => {
    // mock
    const node = buildTriangleNode([]);

    // result
    expect(getVectorFillLoopKeyAtPoint(node, { x: 50, y: 40 })).toBeNull();
  });

  it('should skip a dead loop key (segments no longer exist) and still find a live one covering the point', () => {
    // mock
    const node = buildTriangleNode(['dead[v:x|v:y]', TRIANGLE_LOOP_KEY]);

    // result
    expect(getVectorFillLoopKeyAtPoint(node, { x: 50, y: 40 })).toBe(TRIANGLE_LOOP_KEY);
  });
});
