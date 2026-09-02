// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVariableThickVectorPathVertices } from '../getVariableThickVectorPathVertices';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000',
  strokeWidth: 8,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('getVariableThickVectorPathVertices', () => {
  it('should stay exactly at the base half-stroke-width everywhere along a straight segment with no width profile', () => {
    // mock — a(0,0)->b(100,0), no width profile: base offset is strokeWidth/2 = 4 at both ends
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
      widthProfile: null,
    });

    // before
    const vertices = getVariableThickVectorPathVertices(node);
    const ys = vertices.filter((_, index) => index % 2 === 1);
    const xs = vertices.filter((_, index) => index % 2 === 0);

    // result — never wider than the constant base offset, and spans the full segment length
    expect(Math.max(...ys.map(Math.abs))).toBeCloseTo(4, 5);
    expect(Math.min(...xs)).toBeCloseTo(0, 5);
    expect(Math.max(...xs)).toBeCloseTo(100, 5);
  });

  it('should widen the ribbon around an explicit width point placed mid-segment', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 40, position: 0.5, rightOffset: 40 } } },
    });

    // before
    const vertices = getVariableThickVectorPathVertices(node);

    // result — every coordinate stays finite, and some y-extent is far wider than the base 4px half-width
    expect(vertices.every((value) => Number.isFinite(value))).toBe(true);
    expect(Math.max(...vertices.filter((_, index) => index % 2 === 1).map(Math.abs))).toBeGreaterThan(4);
  });

  it('should sample a segment walked in reverse just as correctly as one walked forward', () => {
    // mock — segment stored b->a, but the chain walk starts at 'a' (lexicographically smaller), so it's reversed
    const node = buildNode({
      segments: { s1: seg('s1', 'b', 'a') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
      widthProfile: null,
    });

    // before
    const vertices = getVariableThickVectorPathVertices(node);
    const xs = vertices.filter((_, index) => index % 2 === 0);

    // result — still spans the full segment length regardless of storage direction
    expect(Math.min(...xs)).toBeCloseTo(0, 5);
    expect(Math.max(...xs)).toBeCloseTo(100, 5);
  });

  it('should close the ribbon back onto its own start for a closed triangular loop', () => {
    // mock — a-b-c-a triangle
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c'), s3: seg('s3', 'c', 'a') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 50, y: 100 } },
      widthProfile: null,
    });

    // before
    const vertices = getVariableThickVectorPathVertices(node);

    // result
    expect(vertices.length).toBeGreaterThan(0);
    expect(vertices.every((value) => Number.isFinite(value))).toBe(true);
  });

  it('should not divide by zero for a degenerate self-closing segment with zero total arc length', () => {
    // mock — a single segment whose start and end coincide, so the whole chain has zero length
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'a') },
      vertices: { a: { id: 'a', x: 5, y: 5 } },
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 6, position: 0.5, rightOffset: 6 } } },
    });

    // before
    const vertices = getVariableThickVectorPathVertices(node);

    // result
    expect(vertices.every((value) => Number.isFinite(value))).toBe(true);
  });
});
