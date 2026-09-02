// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { severVectorSegmentAtPoint } from '../severVectorSegmentAtPoint';

const buildNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

describe('severVectorSegmentAtPoint', () => {
  it('should sever an interior click by minting two coincident, but distinct, vertices', () => {
    // mock — a(0,0)->b(100,0), clicked at t=0.5
    const node = buildNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    // before
    const result = severVectorSegmentAtPoint(node, 's1', 0.5);

    // result — original segment id keeps the "before" half, a fresh id gets the "after" half
    expect(result.segments.s1.startId).toBe('a');
    const afterSegment = Object.values(result.segments).find((segment) => segment.id !== 's1')!;

    expect(afterSegment.endId).toBe('b');
    expect(result.segments.s1.endId).not.toBe(afterSegment.startId);
    expect(result.vertices[result.segments.s1.endId]).toEqual({ id: result.segments.s1.endId, x: 50, y: 0 });
    expect(result.vertices[afterSegment.startId]).toEqual({ id: afterSegment.startId, x: 50, y: 0 });
  });

  it("should sever a click resolved onto the segment's own start endpoint by relabeling only that segment", () => {
    // mock — degree-2 vertex: only s1 touches "a"
    const node = buildNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    // before
    const result = severVectorSegmentAtPoint(node, 's1', 0);

    // result — original vertex "a" untouched, segment now starts at a fresh, coincident vertex
    expect(result.segments.s1.startId).not.toBe('a');
    expect(result.vertices.a).toEqual({ id: 'a', x: 0, y: 0 });
    expect(result.vertices[result.segments.s1.startId]).toEqual({ id: result.segments.s1.startId, x: 0, y: 0 });
    expect(result.segments.s1.endId).toBe('b');
  });

  it("should sever a click resolved onto the segment's own end endpoint", () => {
    // mock
    const node = buildNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    // before
    const result = severVectorSegmentAtPoint(node, 's1', 1);

    // result
    expect(result.segments.s1.endId).not.toBe('b');
    expect(result.vertices.b).toEqual({ id: 'b', x: 100, y: 0 });
    expect(result.vertices[result.segments.s1.endId]).toEqual({ id: result.segments.s1.endId, x: 100, y: 0 });
  });

  it('should only detach the one clicked segment at a 3-way branch vertex, leaving every other segment touching it untouched', () => {
    // mock — a branch vertex "b" shared by s1 (a-b), s2 (b-c), s3 (b-d); click resolves onto b via s2's own startId
    const node = buildNode(
      {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'd', id: 's3', startId: 'b', tangentEnd: null, tangentStart: null },
      },
      {
        a: { id: 'a', x: -100, y: 0 },
        b: { id: 'b', x: 0, y: 0 },
        c: { id: 'c', x: 100, y: 0 },
        d: { id: 'd', x: 0, y: 100 },
      },
    );

    // before — click exactly on s2's own start endpoint (b)
    const result = severVectorSegmentAtPoint(node, 's2', 0);

    // result — s2 detaches from "b", but s1 and s3 still both reference the original "b" vertex
    expect(result.segments.s2.startId).not.toBe('b');
    expect(result.segments.s1.endId).toBe('b');
    expect(result.segments.s3.startId).toBe('b');
    expect(result.vertices.b).toEqual({ id: 'b', x: 0, y: 0 });
  });

  it('should preserve correct tangents on both pieces of an interior curve split', () => {
    // mock
    const node = buildNode(
      { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: { x: -30, y: -60 }, tangentStart: { x: 30, y: -60 } } },
      { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    );

    // before
    const result = severVectorSegmentAtPoint(node, 's1', 0.5);
    const afterSegment = Object.values(result.segments).find((segment) => segment.id !== 's1')!;

    // result — De Casteljau halves each side's own tangent magnitude
    expect(result.segments.s1.tangentStart).toEqual({ x: 15, y: -30 });
    expect(afterSegment.tangentEnd).toEqual({ x: -15, y: -30 });
  });
});
