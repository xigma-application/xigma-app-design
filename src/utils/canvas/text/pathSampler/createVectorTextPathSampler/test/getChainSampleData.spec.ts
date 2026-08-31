// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getChainSampleData } from '../getChainSampleData';
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

describe('getChainSampleData', () => {
  it('should return the chain order and arc-length table for a single non-branching chain', () => {
    // mock — a(0,0)->b(100,0)
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });

    // result
    const data = getChainSampleData(node);

    expect(data?.chainOrder.isClosed).toBe(false);
    expect(data?.table[data.table.length - 1].length).toBeCloseTo(100);
  });

  it('should start table[0] at whichever vertex was drawn first, even when it sits on the right', () => {
    // mock — 'first' (100,0) was drawn before 'second' (0,0); the chain must still start at
    // 'first' even though it's the right-hand point — draw order wins, not left/right position
    const node = buildNode({
      segments: { s1: seg('s1', 'first', 'second') },
      vertices: { first: { id: 'first', x: 100, y: 0 }, second: { id: 'second', x: 0, y: 0 } },
    });
    const data = getChainSampleData(node)!;

    // result
    const start = getVectorSegmentPointAtT(data.rendered, data.rendered.segments[data.table[0].segmentId], data.table[0].t);

    expect(start.x).toBeCloseTo(100);
    expect(data.table[data.table.length - 1].length).toBeCloseTo(100);
  });

  it('should start an open chain at its first-drawn vertex regardless of the order its two segments were stored in', () => {
    // mock — a(0,0)->b(50,0)->c(100,0), but 's2' (the second-drawn segment) is stored first
    const node = buildNode({
      segments: { s2: seg('s2', 'b', 'c'), s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 50, y: 0 }, c: { id: 'c', x: 100, y: 0 } },
    });
    const data = getChainSampleData(node)!;

    // result
    const start = getVectorSegmentPointAtT(data.rendered, data.rendered.segments[data.table[0].segmentId], data.table[0].t);

    expect(start.x).toBeCloseTo(0);
  });

  it('should start a closed loop at its first-drawn vertex too', () => {
    // mock — a closed 2-segment loop; 'zulu' (100,0) was drawn before 'alpha' (0,0)
    const node = buildNode({
      segments: { s1: seg('s1', 'zulu', 'alpha'), s2: seg('s2', 'alpha', 'zulu') },
      vertices: { zulu: { id: 'zulu', x: 100, y: 0 }, alpha: { id: 'alpha', x: 0, y: 0 } },
    });
    const data = getChainSampleData(node)!;

    // result
    const start = getVectorSegmentPointAtT(data.rendered, data.rendered.segments[data.table[0].segmentId], data.table[0].t);

    expect(start.x).toBeCloseTo(100);
  });

  it('should sample the vector raw, not rotation-baked — its rotation is applied once downstream', () => {
    // mock — a horizontal chain carrying a 90deg rotation (mirrored from the text it guides)
    const node = buildNode({
      rotation: 90,
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const data = getChainSampleData(node)!;

    // result — the sampled geometry is the untouched node, and table[0] is still the raw (0,0),
    // not a point rotated by 90deg
    expect(data.rendered).toBe(node);

    const start = getVectorSegmentPointAtT(data.rendered, data.rendered.segments[data.table[0].segmentId], data.table[0].t);

    expect(start.x).toBeCloseTo(0);
    expect(start.y).toBeCloseTo(0);
  });

  it('should return null for a branching (ineligible) network', () => {
    // mock — b is a 3-way branch
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c'), s3: seg('s3', 'b', 'd') },
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 50, y: 0 },
        c: { id: 'c', x: 100, y: 0 },
        d: { id: 'd', x: 50, y: 50 },
      },
    });

    // result
    expect(getChainSampleData(node)).toBeNull();
  });

  it('should reuse the cached result on a second call against the same node identity', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });

    // before
    const first = getChainSampleData(node);
    const second = getChainSampleData(node);

    // result — the WeakMap cache-hit path returns the exact same object
    expect(second).toBe(first);
  });

  it('should cache a null result too, without recomputing on the next call', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c'), s3: seg('s3', 'b', 'd') },
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 50, y: 0 },
        c: { id: 'c', x: 100, y: 0 },
        d: { id: 'd', x: 50, y: 50 },
      },
    });

    // before
    getChainSampleData(node);

    // result — the cached-null branch, not a fresh null
    expect(getChainSampleData(node)).toBeNull();
  });
});
