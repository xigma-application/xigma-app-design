// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { doVectorNodesCross } from '../doVectorNodesCross';

const buildRectangleNode = (id: string, x: number, y: number, width: number, height: number): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id,
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    [`${id}s1`]: { endId: `${id}v2`, id: `${id}s1`, startId: `${id}v1`, tangentEnd: null, tangentStart: null },
    [`${id}s2`]: { endId: `${id}v3`, id: `${id}s2`, startId: `${id}v2`, tangentEnd: null, tangentStart: null },
    [`${id}s3`]: { endId: `${id}v4`, id: `${id}s3`, startId: `${id}v3`, tangentEnd: null, tangentStart: null },
    [`${id}s4`]: { endId: `${id}v1`, id: `${id}s4`, startId: `${id}v4`, tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {
    [`${id}v1`]: { id: `${id}v1`, x, y },
    [`${id}v2`]: { id: `${id}v2`, x: x + width, y },
    [`${id}v3`]: { id: `${id}v3`, x: x + width, y: y + height },
    [`${id}v4`]: { id: `${id}v4`, x, y: y + height },
  },
});

describe('doVectorNodesCross', () => {
  it('should return false when neither node’s bounding box even overlaps', () => {
    // mock
    const nodeA = buildRectangleNode('a', 0, 0, 100, 100);
    const nodeB = buildRectangleNode('b', 500, 500, 100, 100);

    // result
    expect(doVectorNodesCross(nodeA, nodeB)).toBe(false);
  });

  it('should return true when the two rectangles genuinely overlap and their edges cross', () => {
    // mock — staggered by (50,50), a classic crossing overlap
    const nodeA = buildRectangleNode('a', 0, 0, 100, 100);
    const nodeB = buildRectangleNode('b', 50, 50, 100, 100);

    // result
    expect(doVectorNodesCross(nodeA, nodeB)).toBe(true);
  });

  it('should return false when the bounding boxes overlap but the shapes themselves never actually cross (an L-shape whose notch avoids the other rectangle)', () => {
    // mock — nodeA is an L-shape (6 vertices) whose notch cutout exactly avoids nodeB, even though
    // their AABBs overlap
    const nodeA: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
      id: 'a',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        as1: { endId: 'av2', id: 'as1', startId: 'av1', tangentEnd: null, tangentStart: null },
        as2: { endId: 'av3', id: 'as2', startId: 'av2', tangentEnd: null, tangentStart: null },
        as3: { endId: 'av4', id: 'as3', startId: 'av3', tangentEnd: null, tangentStart: null },
        as4: { endId: 'av5', id: 'as4', startId: 'av4', tangentEnd: null, tangentStart: null },
        as5: { endId: 'av6', id: 'as5', startId: 'av5', tangentEnd: null, tangentStart: null },
        as6: { endId: 'av1', id: 'as6', startId: 'av6', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        av1: { id: 'av1', x: 0, y: 0 },
        av2: { id: 'av2', x: 100, y: 0 },
        av3: { id: 'av3', x: 100, y: 40 },
        av4: { id: 'av4', x: 40, y: 40 },
        av5: { id: 'av5', x: 40, y: 100 },
        av6: { id: 'av6', x: 0, y: 100 },
      },
    };
    // nodeB sits entirely inside the L's own empty notch (x:40-100, y:40-100) — AABBs overlap
    // (both span roughly 0-100) but the actual boundaries never cross
    const nodeB = buildRectangleNode('b', 50, 50, 40, 40);

    // result
    expect(doVectorNodesCross(nodeA, nodeB)).toBe(false);
  });

  it('should return false for two rectangles that merely touch along one shared edge without crossing through each other', () => {
    // mock — nodeB starts exactly where nodeA ends on the x-axis, sharing the x=100 edge only
    const nodeA = buildRectangleNode('a', 0, 0, 100, 100);
    const nodeB = buildRectangleNode('b', 100, 0, 100, 100);

    // result
    expect(doVectorNodesCross(nodeA, nodeB)).toBe(false);
  });
});
