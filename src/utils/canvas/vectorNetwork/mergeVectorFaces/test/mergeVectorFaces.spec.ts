// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../../deriveVectorFaces';
import { getVectorFillLoopKey } from '../../getVectorFillLoopKey';
import { mergeVectorFaces } from '../mergeVectorFaces';

// mock — a 100x100 rectangle split in half by a horizontal "divider" segment (e-f), forming a top
// and a bottom face that share exactly that one segment
const splitRectangleNode: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    bottom: { endId: 'd', id: 'bottom', startId: 'c', tangentEnd: null, tangentStart: null },
    divider: { endId: 'f', id: 'divider', startId: 'e', tangentEnd: null, tangentStart: null },
    leftLower: { endId: 'e', id: 'leftLower', startId: 'd', tangentEnd: null, tangentStart: null },
    leftUpper: { endId: 'a', id: 'leftUpper', startId: 'e', tangentEnd: null, tangentStart: null },
    rightLower: { endId: 'c', id: 'rightLower', startId: 'f', tangentEnd: null, tangentStart: null },
    rightUpper: { endId: 'f', id: 'rightUpper', startId: 'b', tangentEnd: null, tangentStart: null },
    top: { endId: 'b', id: 'top', startId: 'a', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {
    a: { id: 'a', x: 0, y: 0 },
    b: { id: 'b', x: 100, y: 0 },
    c: { id: 'c', x: 100, y: 100 },
    d: { id: 'd', x: 0, y: 100 },
    e: { id: 'e', x: 0, y: 50 },
    f: { id: 'f', x: 100, y: 50 },
  },
};

// mock — two 150x200 rectangles overlapping in a "staggered" pattern (regression fixture for a real
// live-caught bug: two rectangles crossing without sharing a vertex used to leave all 3 resulting
// regions unmerged, since every real segment the crossings touch has one interior piece and one
// still-on-the-outer-boundary piece, and the old logic wrongly required BOTH before deleting either).
// Pre-split exactly as persistVectorNetworkCrossings would leave it — real crossing vertices x/y,
// real per-piece segments — since mergeVectorFaces is only ever called post-persistence.
const crossingRectanglesNode: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-2',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    'r1Bottom#0': { endId: 'x', id: 'r1Bottom#0', startId: 'r1c', tangentEnd: null, tangentStart: null },
    'r1Bottom#1': { endId: 'r1d', id: 'r1Bottom#1', startId: 'x', tangentEnd: null, tangentStart: null },
    r1Left: { endId: 'r1a', id: 'r1Left', startId: 'r1d', tangentEnd: null, tangentStart: null },
    'r1Right#0': { endId: 'y', id: 'r1Right#0', startId: 'r1b', tangentEnd: null, tangentStart: null },
    'r1Right#1': { endId: 'r1c', id: 'r1Right#1', startId: 'y', tangentEnd: null, tangentStart: null },
    r1Top: { endId: 'r1b', id: 'r1Top', startId: 'r1a', tangentEnd: null, tangentStart: null },
    r2Bottom: { endId: 'r2d', id: 'r2Bottom', startId: 'r2c', tangentEnd: null, tangentStart: null },
    'r2Left#0': { endId: 'x', id: 'r2Left#0', startId: 'r2d', tangentEnd: null, tangentStart: null },
    'r2Left#1': { endId: 'r2a', id: 'r2Left#1', startId: 'x', tangentEnd: null, tangentStart: null },
    r2Right: { endId: 'r2c', id: 'r2Right', startId: 'r2b', tangentEnd: null, tangentStart: null },
    'r2Top#0': { endId: 'y', id: 'r2Top#0', startId: 'r2a', tangentEnd: null, tangentStart: null },
    'r2Top#1': { endId: 'r2b', id: 'r2Top#1', startId: 'y', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {
    r1a: { id: 'r1a', x: 900, y: 300 },
    r1b: { id: 'r1b', x: 1050, y: 300 },
    r1c: { id: 'r1c', x: 1050, y: 500 },
    r1d: { id: 'r1d', x: 900, y: 500 },
    r2a: { id: 'r2a', x: 975, y: 400 },
    r2b: { id: 'r2b', x: 1125, y: 400 },
    r2c: { id: 'r2c', x: 1125, y: 600 },
    r2d: { id: 'r2d', x: 975, y: 600 },
    x: { id: 'x', x: 975, y: 500 },
    y: { id: 'y', x: 1050, y: 400 },
  },
};

describe('mergeVectorFaces', () => {
  it('should merge all 3 regions of two crossing rectangles into one face — regression for the two-crossing-shapes bug', () => {
    // before
    const faces = deriveVectorFaces(crossingRectanglesNode);

    expect(faces).toHaveLength(3);

    // action
    const merged = mergeVectorFaces(crossingRectanglesNode, faces);

    // result
    expect(merged.filledFaceKeys).toHaveLength(1);
    expect(deriveVectorFaces({ ...merged, filledFaceKeys: [] })).toHaveLength(1);
  });

  it('should delete the divider segment and fill the resulting single face, when both faces are touched', () => {
    // before
    const faces = deriveVectorFaces(splitRectangleNode);

    // action
    const merged = mergeVectorFaces(splitRectangleNode, faces);

    // result
    expect(merged.segments.divider).toBeUndefined();
    expect(Object.keys(merged.segments)).toEqual(['bottom', 'leftLower', 'leftUpper', 'rightLower', 'rightUpper', 'top']);
    expect(merged.vertices).toEqual(splitRectangleNode.vertices);
    expect(merged.filledFaceKeys).toHaveLength(1);
    expect(deriveVectorFaces({ ...merged, filledFaceKeys: [] })).toHaveLength(1);
  });

  it('should keep the divider segment and only fill the touched face, when just one face is touched', () => {
    // before
    const [firstFace] = deriveVectorFaces(splitRectangleNode);

    // action
    const merged = mergeVectorFaces(splitRectangleNode, [firstFace]);

    // result
    expect(merged.segments.divider).toBeDefined();
    expect(merged.filledFaceKeys).toEqual([getVectorFillLoopKey(firstFace.pieceKeys)]);
  });

  it('should leave the node untouched when no faces are touched', () => {
    // action
    const merged = mergeVectorFaces(splitRectangleNode, []);

    // result
    expect(merged.segments).toEqual(splitRectangleNode.segments);
    expect(merged.filledFaceKeys).toEqual([]);
  });
});
