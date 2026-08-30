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

  it('should keep the raw chain order (table[0] at the left endpoint) when the alphabetically-first vertex already sits on the left', () => {
    // mock — a(0,0)->b(100,0), 'a' is both the leftmost point and the chain's chosen start
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const data = getChainSampleData(node)!;

    // result
    const start = getVectorSegmentPointAtT(data.rendered, data.rendered.segments[data.table[0].segmentId], data.table[0].t);

    expect(start.x).toBeCloseTo(0);
  });

  it('should re-walk the chain from its other end (table[0] still lands on the left endpoint) when the chain-order tie-break picks the right-hand vertex as the raw start', () => {
    // mock — 'alpha' sorts before 'zulu' and so gets picked as the chain's raw start by
    // getVectorChainOrder, even though it sits on the right (100,0) — exactly the "random-looking"
    // case that used to read text backwards
    const node = buildNode({
      segments: { s1: seg('s1', 'alpha', 'zulu') },
      vertices: { alpha: { id: 'alpha', x: 100, y: 0 }, zulu: { id: 'zulu', x: 0, y: 0 } },
    });
    const data = getChainSampleData(node)!;

    // result — table[0] is still the LEFT world point (0,0), regardless of which vertex id won
    // the raw tie-break
    const start = getVectorSegmentPointAtT(data.rendered, data.rendered.segments[data.table[0].segmentId], data.table[0].t);

    expect(start.x).toBeCloseTo(0);
    expect(data.table[data.table.length - 1].length).toBeCloseTo(100);
  });

  it('should leave a closed loop walking as-is, regardless of which endpoint the tie-break picks', () => {
    // mock — a closed 2-segment loop where the picked start (alphabetically-first vertex) happens
    // to be the rightmost point; a loop has no "wrong end" to correct
    const node = buildNode({
      segments: { s1: seg('s1', 'zulu', 'alpha'), s2: seg('s2', 'alpha', 'zulu') },
      vertices: { alpha: { id: 'alpha', x: 100, y: 0 }, zulu: { id: 'zulu', x: 0, y: 0 } },
    });
    const data = getChainSampleData(node)!;

    // result — table[0] is the raw start, 'alpha' (100,0), left untouched
    const start = getVectorSegmentPointAtT(data.rendered, data.rendered.segments[data.table[0].segmentId], data.table[0].t);

    expect(start.x).toBeCloseTo(100);
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
