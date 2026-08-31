// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from '../getVectorFillLoopKey';
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

  it('should return the smallest, innermost loop’s key when the point sits inside three nested filled rectangles drawn one inside another', () => {
    // mock — a 200x200 outer, a 140x140 middle, and a 100x100 inner rectangle, all centered on the
    // same point and drawn as three disconnected loops on the same node (no shared vertex/segment) —
    // deriveVectorFaces has no notion of a "hole", so it produces 3 ordinary, independent faces. The
    // middle rectangle also exercises the reduce's "candidate isn't smaller, keep the current
    // smallest" branch, not just "found a new smallest" every time
    const node: TVectorNode = {
      fillColor: '#000000',
      filledFaceKeys: [],
      id: '1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
        s5: { endId: 'v6', id: 's5', startId: 'v5', tangentEnd: null, tangentStart: null },
        s6: { endId: 'v7', id: 's6', startId: 'v6', tangentEnd: null, tangentStart: null },
        s7: { endId: 'v8', id: 's7', startId: 'v7', tangentEnd: null, tangentStart: null },
        s8: { endId: 'v5', id: 's8', startId: 'v8', tangentEnd: null, tangentStart: null },
        sm1: { endId: 'vm2', id: 'sm1', startId: 'vm1', tangentEnd: null, tangentStart: null },
        sm2: { endId: 'vm3', id: 'sm2', startId: 'vm2', tangentEnd: null, tangentStart: null },
        sm3: { endId: 'vm4', id: 'sm3', startId: 'vm3', tangentEnd: null, tangentStart: null },
        sm4: { endId: 'vm1', id: 'sm4', startId: 'vm4', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#ffffff',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 200, y: 0 },
        v3: { id: 'v3', x: 200, y: 200 },
        v4: { id: 'v4', x: 0, y: 200 },
        v5: { id: 'v5', x: 50, y: 50 },
        v6: { id: 'v6', x: 150, y: 50 },
        v7: { id: 'v7', x: 150, y: 150 },
        v8: { id: 'v8', x: 50, y: 150 },
        vm1: { id: 'vm1', x: 30, y: 30 },
        vm2: { id: 'vm2', x: 170, y: 30 },
        vm3: { id: 'vm3', x: 170, y: 170 },
        vm4: { id: 'vm4', x: 30, y: 170 },
      },
    };
    const faces = deriveVectorFaces(node);
    const outerFace = faces.find((face) => face.points.some((point) => point.x === 200))!;
    const middleFace = faces.find((face) => face.points.some((point) => point.x === 170))!;
    const innerFace = faces.find((face) => face.points.every((point) => point.x !== 200 && point.x !== 170))!;
    const outerKey = getVectorFillLoopKey(outerFace.pieceKeys);
    const middleKey = getVectorFillLoopKey(middleFace.pieceKeys);
    const innerKey = getVectorFillLoopKey(innerFace.pieceKeys);
    // inner listed before middle so the reduce also hits its "candidate isn't smaller than the
    // current smallest, keep it" branch when middle is checked against the already-smaller inner
    const filledNode = { ...node, filledFaceKeys: [outerKey, innerKey, middleKey] };

    // result — (100,100) sits inside all 3 rectangles; the smallest, innermost one wins
    expect(getVectorFillLoopKeyAtPoint(filledNode, { x: 100, y: 100 })).toBe(innerKey);
  });

  it('should return null for a point inside an unfilled loop nested in a filled outer one, not the outer’s key', () => {
    // mock — a filled outer square with a smaller, completely unfilled square nested inside it (two
    // disjoint loops, no shared vertex/segment — a shape dragged inside another). The paint tool must
    // recognize the inner loop as its own (currently unfilled) face, not read every point inside it
    // as "the outer fill is here", or it could only ever remove the outer fill and never paint —
    // or later toggle — the inner loop on its own.
    const node: TVectorNode = {
      fillColor: '#000000',
      filledFaceKeys: [],
      id: '1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        inner1: { endId: 'i2', id: 'inner1', startId: 'i1', tangentEnd: null, tangentStart: null },
        inner2: { endId: 'i3', id: 'inner2', startId: 'i2', tangentEnd: null, tangentStart: null },
        inner3: { endId: 'i4', id: 'inner3', startId: 'i3', tangentEnd: null, tangentStart: null },
        inner4: { endId: 'i1', id: 'inner4', startId: 'i4', tangentEnd: null, tangentStart: null },
        outer1: { endId: 'o2', id: 'outer1', startId: 'o1', tangentEnd: null, tangentStart: null },
        outer2: { endId: 'o3', id: 'outer2', startId: 'o2', tangentEnd: null, tangentStart: null },
        outer3: { endId: 'o4', id: 'outer3', startId: 'o3', tangentEnd: null, tangentStart: null },
        outer4: { endId: 'o1', id: 'outer4', startId: 'o4', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#ffffff',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        i1: { id: 'i1', x: 20, y: 20 },
        i2: { id: 'i2', x: 80, y: 20 },
        i3: { id: 'i3', x: 80, y: 80 },
        i4: { id: 'i4', x: 20, y: 80 },
        o1: { id: 'o1', x: 0, y: 0 },
        o2: { id: 'o2', x: 100, y: 0 },
        o3: { id: 'o3', x: 100, y: 100 },
        o4: { id: 'o4', x: 0, y: 100 },
      },
    };
    const faces = deriveVectorFaces(node);
    const outerFace = faces.find((face) => face.points.some((point) => point.x === 100))!;
    const outerKey = getVectorFillLoopKey(outerFace.pieceKeys);
    const filledNode = { ...node, filledFaceKeys: [outerKey] };

    // result — (50,50) is inside the unfilled inner square, not the outer's key
    expect(getVectorFillLoopKeyAtPoint(filledNode, { x: 50, y: 50 })).toBeNull();
    // result — (10,50) is in the frame area, only inside the outer's own polygon
    expect(getVectorFillLoopKeyAtPoint(filledNode, { x: 10, y: 50 })).toBe(outerKey);
  });
});
