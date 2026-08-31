// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorChainPositionAtLength } from '../getVectorChainPositionAtLength';
import { getVectorChainArcLengthTable } from '../getVectorChainArcLengthTable';
import { getVectorChainOrder, TVectorChainOrder } from '../getVectorChainOrder/getVectorChainOrder';

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

describe('getVectorChainPositionAtLength', () => {
  it('should resolve length 0 to the exact chain start', () => {
    // mock — a(0,0)->b(100,0)
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const chainOrder = getVectorChainOrder(node)!;
    const table = getVectorChainArcLengthTable(node, chainOrder);

    // result
    expect(getVectorChainPositionAtLength(table, 0)).toEqual({ segmentId: 's1', t: 0 });
  });

  it('should resolve the total chain length to the exact chain end', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const chainOrder = getVectorChainOrder(node)!;
    const table = getVectorChainArcLengthTable(node, chainOrder);

    // result
    const position = getVectorChainPositionAtLength(table, 100);

    expect(position.segmentId).toBe('s1');
    expect(position.t).toBeCloseTo(1, 5);
  });

  it('should linearly interpolate t within a single straight segment', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const chainOrder = getVectorChainOrder(node)!;
    const table = getVectorChainArcLengthTable(node, chainOrder);

    // result
    const position = getVectorChainPositionAtLength(table, 30);

    expect(position.segmentId).toBe('s1');
    expect(position.t).toBeCloseTo(0.3, 5);
  });

  it('should interpolate from the vertex (t=0) up to the next segment sample when the target falls between two samples that straddle a segment boundary', () => {
    // mock — a(0,0)->b(10,0)->c(110,0), two straight segments of very different lengths
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 }, c: { id: 'c', x: 110, y: 0 } },
    });
    const chainOrder = getVectorChainOrder(node)!;
    const table = getVectorChainArcLengthTable(node, chainOrder);
    const boundaryIndex = table.findIndex((entry, index) => index > 0 && entry.segmentId !== table[index - 1].segmentId);
    const lower = table[boundaryIndex - 1];
    const upper = table[boundaryIndex];

    // before — a target length exactly halfway from the vertex (lower.length) to the next recorded
    // s2 sample — `lower` itself is s1's own last sample, filed under s1's t, not s2's implicit t=0
    const targetLength = (lower.length + upper.length) / 2;
    const position = getVectorChainPositionAtLength(table, targetLength);

    // result — halfway from the vertex's implicit t=0 to upper.t, not frozen at upper.t
    expect(position.segmentId).toBe(upper.segmentId);
    expect(position.t).toBeCloseTo(upper.t / 2, 10);
  });

  it('should keep walking forward across a boundary into a reversed segment, instead of jumping to its far end', () => {
    // mock — a(0,0)->b(10,0), then c(110,0)->b(10,0) stored backwards but walked b->c (reversed)
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'c', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 }, c: { id: 'c', x: 110, y: 0 } },
    });
    const chainOrder: TVectorChainOrder = {
      entries: [
        { reversed: false, segmentId: 's1' },
        { reversed: true, segmentId: 's2' },
      ],
      isClosed: false,
    };
    const table = getVectorChainArcLengthTable(node, chainOrder);

    // before — halfway into s2 (length 60 = vertex b at 10, plus half of s2's 100px), so the point
    // should sit at (60,0): halfway between b and c, i.e. s2's t=0.5, not snapped to its t=0 end (c)
    const position = getVectorChainPositionAtLength(table, 60);

    expect(position.segmentId).toBe('s2');
    expect(position.t).toBeCloseTo(0.5, 5);
  });

  it('should fall back to ratio 0 without dividing by zero when a segment-boundary sample has a zero-length span', () => {
    // mock — a hand-built table: two different segments whose recorded samples land at the exact
    // same cumulative length (a zero-length span straddling the boundary)
    const table = [
      { length: 0, segmentId: 's1', t: 0 },
      { length: 0, segmentId: 's2', t: 1 },
    ];

    // result
    const position = getVectorChainPositionAtLength(table, 0);

    expect(position).toEqual({ segmentId: 's2', t: 0 });
  });

  it('should fall back to the lower sample without dividing by zero when two same-segment samples share a length', () => {
    // mock — a self-closing zero-length segment, every sample has the same (zero) length
    const node = buildNode({ segments: { s1: seg('s1', 'a', 'a') }, vertices: { a: { id: 'a', x: 5, y: 5 } } });
    const chainOrder = getVectorChainOrder(node)!;
    const table = getVectorChainArcLengthTable(node, chainOrder);

    // result
    const position = getVectorChainPositionAtLength(table, 0);

    expect(position.segmentId).toBe('s1');
    expect(Number.isFinite(position.t)).toBe(true);
  });
});
