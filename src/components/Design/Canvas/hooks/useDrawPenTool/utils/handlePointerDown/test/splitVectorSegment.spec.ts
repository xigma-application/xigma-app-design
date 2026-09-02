// types
import { NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorFillPieceKey } from 'utils/canvas/vectorNetwork/getVectorFillPieceKey';
import { splitVectorSegment } from '../splitVectorSegment';

const node: TVectorNode = {
  defaultFill: null,
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
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
};

describe('splitVectorSegment', () => {
  it('should insert a new vertex at the split parameter and split the segment into two around it', () => {
    // before — a straight segment, split at its midpoint (t=0.5)
    const { newVertexId, segments, vertices } = splitVectorSegment(node, 's1', 0.5);

    // result
    expect(newVertexId).not.toBe('v1');
    expect(newVertexId).not.toBe('v2');
    expect(segments.s1).toEqual({ endId: newVertexId, id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null });
    expect(Object.keys(segments)).toHaveLength(2);

    const newSegmentId = Object.keys(segments).find((id) => id !== 's1') as string;

    expect(segments[newSegmentId]).toEqual({ endId: 'v2', id: newSegmentId, startId: newVertexId, tangentEnd: null, tangentStart: null });
    expect(vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 0 });
  });

  it('should round the split point to the nearest half pixel, matching Figma, not the nearest whole one', () => {
    // before — t=0.503 along v1(0,0)->v2(100,0) lands at x=50.3, closer to the 50.5 grid line than to 50
    const { newVertexId, vertices } = splitVectorSegment(node, 's1', 0.503);

    // result
    expect(vertices[newVertexId]).toEqual({ id: newVertexId, x: 50.5, y: 0 });
  });

  it('should De Casteljau-split the original tangents so both halves stay C1-continuous, not just keep the outer tangents unchanged', () => {
    // mock — a curved segment with both tangents set
    const curvedNode: TVectorNode = {
      ...node,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: -5, y: 0 }, tangentStart: { x: 5, y: 0 } } },
    };

    // before
    const { newVertexId, segments, vertices } = splitVectorSegment(curvedNode, 's1', 0.5);
    const newSegmentId = Object.keys(segments).find((id) => id !== 's1') as string;

    // result — hand-derived via De Casteljau (see splitCubicBezier.spec.ts): the split point lands at
    // (50,0); even the outer tangents scale down (2.5,0)/(-2.5,0), and the two inner tangents
    // ((-23.75,0) / (23.75,0)) mirror each other exactly — unlike the old naive split, which just kept
    // the original (5,0)/(-5,0) unchanged and nulled the shared vertex, leaving a visible kink
    expect(vertices[newVertexId]).toEqual({ id: newVertexId, x: 50, y: 0 });
    expect(segments.s1).toMatchObject({ tangentEnd: { x: -23.75, y: 0 }, tangentStart: { x: 2.5, y: 0 } });
    expect(segments[newSegmentId]).toMatchObject({ tangentEnd: { x: -2.5, y: 0 }, tangentStart: { x: 23.75, y: 0 } });
    expect(segments[newSegmentId].startId).toBe(newVertexId);
  });

  it('should remap a filled face whose stored key spans the whole segment being split, so the fill does not go stale', () => {
    // mock — v1(0,0) to v2(100,0) is one side of an already-filled triangle
    const filledNode: TVectorNode = {
      ...node,
      fillByKey: { 's1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]': [{ color: '#D9D9D9', opacity: 100, type: 'solid' }] },
      filledFaceKeys: ['s1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]'],
      segments: {
        ...node.segments,
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v3', id: 's3', startId: 'v1', tangentEnd: null, tangentStart: null },
      },
    };

    // before
    const { fillByKey, filledFaceKeys, newVertexId, newSegmentId } = ((): {
      fillByKey: Record<string, TPaint[]>;
      filledFaceKeys: string[];
      newSegmentId: string;
      newVertexId: string;
    } => {
      const result = splitVectorSegment(filledNode, 's1', 0.5);
      const splitOffId = Object.keys(result.segments).find((id) => id !== 's1' && id !== 's2' && id !== 's3') as string;

      return { ...result, newSegmentId: splitOffId };
    })();

    // result — the old key referencing s1's full v1->v2 span is gone; the recomputed key threads the
    // new midpoint vertex through both halves, and the color rides along to the new key. Both piece
    // order and each piece's internal boundary order are alphabetical (see getVectorFillPieceKey/
    // getVectorFillLoopKey) and newVertexId/newSegmentId are random nanoids, so build the expected
    // pieces with the same helper rather than assuming where they sort relative to v1/v2/s1-s3.
    const expectedPieces = [
      getVectorFillPieceKey('s1', { end: `v:${newVertexId}`, start: 'v:v1' }),
      getVectorFillPieceKey('s2', { end: 'v:v3', start: 'v:v2' }),
      getVectorFillPieceKey('s3', { end: 'v:v3', start: 'v:v1' }),
      getVectorFillPieceKey(newSegmentId, { end: `v:${newVertexId}`, start: 'v:v2' }),
    ];

    expect(filledFaceKeys).toHaveLength(1);
    expect(new Set(filledFaceKeys[0].split(','))).toEqual(new Set(expectedPieces));
    expect(fillByKey).toEqual({ [filledFaceKeys[0]]: [{ color: '#D9D9D9', opacity: 100, type: 'solid' }] });
  });
});
