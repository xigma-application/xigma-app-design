// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { createVectorTextPathSampler } from '../createVectorTextPathSampler';
import { getVectorChainArcLengthTable } from '../../../../vectorNetwork/getVectorChainArcLengthTable';
import { getVectorChainOrder } from '../../../../vectorNetwork/getVectorChainOrder/getVectorChainOrder';
import { getVectorSegmentPointAtT } from '../../../../vectorNetwork/getVectorSegmentPointAtT';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: '#000',
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

// text bbox unrelated to the vector's own geometry — the sampler returns points relative to
// this box's centre, which the caller then adds back
const BOX = { height: 100, rotation: 0, width: 100, x: 0, y: 0 };

describe('createVectorTextPathSampler', () => {
  it('should report isClosed false and the segment length as totalLength for a straight open chain', () => {
    // mock — a(0,0)->b(100,0)
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });

    // result
    const sampler = createVectorTextPathSampler(BOX, node);

    expect(sampler.isClosed).toBe(false);
    expect(sampler.totalLength).toBeCloseTo(100);
  });

  it('should return the chain start (centre-relative) at length 0', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });

    // result — box centre is (50,50); world point a=(0,0) -> centre-relative (-50,-50)
    const sample = createVectorTextPathSampler(BOX, node).sampleAtLength(0);

    expect(sample.x).toBeCloseTo(-50);
    expect(sample.y).toBeCloseTo(-50);
  });

  it('should still start reading at the left (length 0) and point rightward, even when the chain-order tie-break picks the right-hand vertex as the raw start', () => {
    // mock — 'alpha' sorts before 'zulu' and so gets picked as the chain's raw start by
    // getVectorChainOrder, even though it sits on the right (100,0); without the reading-direction
    // correction this would make text start on the right and read backwards
    const node = buildNode({
      segments: { s1: seg('s1', 'alpha', 'zulu') },
      vertices: { alpha: { id: 'alpha', x: 100, y: 0 }, zulu: { id: 'zulu', x: 0, y: 0 } },
    });
    const sampler = createVectorTextPathSampler(BOX, node);

    // result — length 0 is the LEFT point (0,0) -> centre-relative (-50,-50), angle pointing +x
    const start = sampler.sampleAtLength(0);
    const end = sampler.sampleAtLength(sampler.totalLength);

    expect(start.x).toBeCloseTo(-50);
    expect(start.y).toBeCloseTo(-50);
    expect(((start.angleDegrees % 360) + 360) % 360).toBeCloseTo(0);
    expect(end.x).toBeCloseTo(50);
    expect(end.y).toBeCloseTo(-50);
  });

  it('should keep nearestOffsetAtPoint consistent with the reading-corrected sampleAtLength direction', () => {
    // mock — same right-hand-tie-break chain as above; a point near the LEFT (world) endpoint must
    // resolve to a fractional offset near 0, matching where sampleAtLength(0) actually renders the
    // first glyph (nearestOffsetAtPoint's offset is a 0..1 fraction of totalLength, not a length)
    const node = buildNode({
      segments: { s1: seg('s1', 'alpha', 'zulu') },
      vertices: { alpha: { id: 'alpha', x: 100, y: 0 }, zulu: { id: 'zulu', x: 0, y: 0 } },
    });
    const sampler = createVectorTextPathSampler(BOX, node);

    // result
    const nearLeft = sampler.nearestOffsetAtPoint({ x: 5, y: 0 });
    const nearRight = sampler.nearestOffsetAtPoint({ x: 95, y: 0 });

    expect(nearLeft.offset).toBeCloseTo(0.05);
    expect(nearRight.offset).toBeCloseTo(0.95);
  });

  it('should return the same left-to-right tangent angle whether the segment is stored a->b or b->a', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });

    // before — the tangent of a horizontal left-to-right segment
    const forward = createVectorTextPathSampler(BOX, node).sampleAtLength(0).angleDegrees;

    // mock — the same physical a(0,0)->b(100,0) line, but the segment itself is stored reversed
    // (b->a); the chain still walks it starting from 'a', so the reading direction is identical
    const reversedStorageNode = buildNode({
      segments: { s1: seg('s1', 'b', 'a') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const backward = createVectorTextPathSampler(BOX, reversedStorageNode).sampleAtLength(0).angleDegrees;

    // result — same on-screen line, same reading direction, so the same tangent angle regardless
    // of which way the segment happens to be stored
    expect((((forward - backward) % 360) + 360) % 360).toBeCloseTo(0);
  });

  it('should clamp beyond the chain end for an open chain instead of wrapping', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const sampler = createVectorTextPathSampler(BOX, node);

    // result — length 150 on a 100-long chain clamps to the exact endpoint b=(100,0) -> (50,-50)
    const atEnd = sampler.sampleAtLength(100);
    const beyondEnd = sampler.sampleAtLength(150);

    expect(beyondEnd).toEqual(atEnd);
    expect(atEnd.x).toBeCloseTo(50);
  });

  it('should wrap modulo totalLength for a closed loop', () => {
    // mock — a(0,0)->b(100,0)->a, a closed 2-segment loop, total length 200
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'a') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const sampler = createVectorTextPathSampler(BOX, node);

    // result — 250 wraps to 50, the same point as sampling at 50 directly
    const wrapped = sampler.sampleAtLength(250);
    const direct = sampler.sampleAtLength(50);

    expect(sampler.isClosed).toBe(true);
    expect(wrapped.x).toBeCloseTo(direct.x);
    expect(wrapped.y).toBeCloseTo(direct.y);
  });

  it('should resolve nearestOffsetAtPoint to the projected world point, offset, and distance', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const sampler = createVectorTextPathSampler(BOX, node);

    // result — a point 10 units off the segment's quarter-mark
    const nearest = sampler.nearestOffsetAtPoint({ x: 25, y: 10 });

    expect(nearest.offset).toBeCloseTo(0.25, 2);
    expect(nearest.distance).toBeCloseTo(10, 2);
    expect(nearest.point.x).toBeCloseTo(25, 2);
  });

  it('should reuse the cached chain data on a second call against the same node identity', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });

    // before
    const first = createVectorTextPathSampler(BOX, node).sampleAtLength(0);
    const second = createVectorTextPathSampler(BOX, node).sampleAtLength(0);

    // result — the WeakMap cache-hit path returns the exact same data
    expect(second).toEqual(first);
  });

  it('should snap to the next segment own sample when a length falls between two samples that straddle a segment boundary', () => {
    // mock — a(0,0)->b(10,0)->c(110,0), two straight segments of very different lengths (mirrors
    // the equivalent getVectorChainPositionAtFraction case)
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 }, c: { id: 'c', x: 110, y: 0 } },
    });
    const chainOrder = getVectorChainOrder(node)!;
    const table = getVectorChainArcLengthTable(node, chainOrder);
    const boundaryIndex = table.findIndex((entry, index) => index > 0 && entry.segmentId !== table[index - 1].segmentId);
    const lower = table[boundaryIndex - 1];
    const upper = table[boundaryIndex];
    const sampler = createVectorTextPathSampler(BOX, node);

    // before — a length exactly between the two samples straddling the s1/s2 boundary
    const targetLength = (lower.length + upper.length) / 2;
    const sample = sampler.sampleAtLength(targetLength);
    const expectedWorld = getVectorSegmentPointAtT(node, node.segments[upper.segmentId], upper.t);

    // result — snaps to the upper (next-segment) sample, not an interpolation across the boundary
    expect(sample.x).toBeCloseTo(expectedWorld.x - BOX.width / 2);
    expect(sample.y).toBeCloseTo(expectedWorld.y - BOX.height / 2);
  });

  it('should fall back to the lower sample without dividing by zero when two same-segment samples share a length', () => {
    // mock — a(0,0)->b(0,0) is a zero-length lead-in segment (both vertices coincide), followed by
    // a real b->c segment, so the chain's totalLength is non-zero even though s1's own samples are
    // all stuck at length 0
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 0, y: 0 }, c: { id: 'c', x: 100, y: 0 } },
    });
    const sampler = createVectorTextPathSampler(BOX, node);

    // result — length 0 lands on two same-segment (s1) table samples that share length 0
    const sample = sampler.sampleAtLength(0);

    expect(Number.isFinite(sample.x)).toBe(true);
    expect(Number.isFinite(sample.y)).toBe(true);
    expect(sample.x).toBeCloseTo(0 - BOX.width / 2);
    expect(sample.y).toBeCloseTo(0 - BOX.height / 2);
  });

  it('should return the zero sample directly for a zero-length (coincident-point) chain instead of dividing by zero', () => {
    // mock — a self-closing segment whose start and end are the same vertex
    const node = buildNode({ segments: { s1: seg('s1', 'a', 'a') }, vertices: { a: { id: 'a', x: 5, y: 5 } } });
    const sampler = createVectorTextPathSampler(BOX, node);

    // result
    expect(sampler.isClosed).toBe(true);
    expect(sampler.totalLength).toBe(0);
    expect(sampler.sampleAtLength(10)).toEqual({ angleDegrees: 0, x: 0, y: 0 });
  });

  it('should fall back to a degenerate zero-length sampler for a branching (ineligible) network', () => {
    // mock — b is a 3-way branch, getVectorChainOrder returns null
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c'), s3: seg('s3', 'b', 'd') },
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 50, y: 0 },
        c: { id: 'c', x: 100, y: 0 },
        d: { id: 'd', x: 50, y: 50 },
      },
    });
    const sampler = createVectorTextPathSampler(BOX, node);

    // result
    expect(sampler.isClosed).toBe(false);
    expect(sampler.totalLength).toBe(0);
    expect(sampler.sampleAtLength(10)).toEqual({ angleDegrees: 0, x: 0, y: 0 });
    expect(sampler.nearestOffsetAtPoint({ x: 999, y: 999 })).toEqual({ distance: Infinity, offset: 0, point: { x: 50, y: 50 } });
  });
});
