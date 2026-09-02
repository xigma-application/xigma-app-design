// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../../deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from '../../getVectorFillLoopKey';
import { groupCrossingVectorNodes } from '../groupCrossingVectorNodes';

const buildRectangleNode = (id: string, x: number, y: number, width: number, height: number): TVectorNode => ({
  defaultFill: null,
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

describe('groupCrossingVectorNodes', () => {
  it('should return a single group containing just that node when given one node', () => {
    // mock
    const nodeA = buildRectangleNode('a', 0, 0, 100, 100);

    // result
    const groups = groupCrossingVectorNodes([nodeA]);

    expect(groups).toHaveLength(1);
    expect(groups[0].nodeIds).toEqual(['a']);
    expect(groups[0].combinedNode).toBe(nodeA); // untouched, exact same reference
  });

  it('should group two genuinely crossing nodes into one, combining their segments/vertices with crossings persisted', () => {
    // mock
    const nodeA = buildRectangleNode('a', 0, 0, 100, 100);
    const nodeB = buildRectangleNode('b', 50, 50, 100, 100);

    // result
    const groups = groupCrossingVectorNodes([nodeA, nodeB]);

    expect(groups).toHaveLength(1);
    expect(groups[0].nodeIds).toEqual(['a', 'b']); // a first — lowest in the input (rootOrder) order
    expect(Object.keys(groups[0].combinedNode.segments).length).toBeGreaterThan(8); // real crossings split pieces off
    expect(groups[0].combinedNode.rotation).toBe(0);
  });

  it('should union both members’ own picked fill colors into the combined node, not just the survivor’s', () => {
    // mock — each rectangle is individually filled with its own picked color
    const bareA = buildRectangleNode('a', 0, 0, 100, 100);
    const bareB = buildRectangleNode('b', 50, 50, 100, 100);
    const [faceA] = deriveVectorFaces(bareA);
    const [faceB] = deriveVectorFaces(bareB);
    const keyA = getVectorFillLoopKey(faceA.pieceKeys);
    const keyB = getVectorFillLoopKey(faceB.pieceKeys);
    const nodeA = { ...bareA, fillByKey: { [keyA]: [{ color: '#ff0000', opacity: 100, type: 'solid' as const }] }, filledFaceKeys: [keyA] };
    const nodeB = { ...bareB, fillByKey: { [keyB]: [{ color: '#00ff00', opacity: 100, type: 'solid' as const }] }, filledFaceKeys: [keyB] };

    // result
    const groups = groupCrossingVectorNodes([nodeA, nodeB]);

    expect(groups[0].combinedNode.fillByKey).toEqual({
      [keyA]: [{ color: '#ff0000', opacity: 100, type: 'solid' as const }],
      [keyB]: [{ color: '#00ff00', opacity: 100, type: 'solid' as const }],
    });
  });

  it('should return two independent singleton groups for two nodes that never cross', () => {
    // mock
    const nodeA = buildRectangleNode('a', 0, 0, 100, 100);
    const nodeB = buildRectangleNode('b', 1000, 0, 100, 100);

    // result
    const groups = groupCrossingVectorNodes([nodeA, nodeB]);

    expect(groups).toHaveLength(2);
    expect(groups.map((group) => group.nodeIds)).toEqual([['a'], ['b']]);
  });

  it('should transitively group 3 nodes into one when A crosses B and B crosses C, even though A and C never touch', () => {
    // mock — A(0,0)-100x100, B(50,50)-100x100 (crosses A, same 50,50 stagger proven above), C(100,100)-
    // 100x100 (crosses B the same way, but only shares a single corner point with A — not a real crossing)
    const nodeA = buildRectangleNode('a', 0, 0, 100, 100);
    const nodeB = buildRectangleNode('b', 50, 50, 100, 100);
    const nodeC = buildRectangleNode('c', 100, 100, 100, 100);

    // result
    const groups = groupCrossingVectorNodes([nodeA, nodeB, nodeC]);

    expect(groups).toHaveLength(1);
    expect(groups[0].nodeIds).toEqual(['a', 'b', 'c']);
  });

  it('should keep an unrelated singleton separate from a crossing pair found among the same touched nodes', () => {
    // mock — A crosses B, C is far away and unrelated to either
    const nodeA = buildRectangleNode('a', 0, 0, 100, 100);
    const nodeB = buildRectangleNode('b', 50, 50, 100, 100);
    const nodeC = buildRectangleNode('c', 1000, 1000, 100, 100);

    // result
    const groups = groupCrossingVectorNodes([nodeA, nodeB, nodeC]);

    expect(groups).toHaveLength(2);
    expect(groups.find((group) => group.nodeIds.length === 2)?.nodeIds).toEqual(['a', 'b']);
    expect(groups.find((group) => group.nodeIds.length === 1)?.nodeIds).toEqual(['c']);
  });
});
