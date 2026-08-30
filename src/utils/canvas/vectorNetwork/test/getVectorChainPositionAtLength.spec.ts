// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorChainPositionAtLength } from '../getVectorChainPositionAtLength';
import { getVectorChainArcLengthTable } from '../getVectorChainArcLengthTable';
import { getVectorChainOrder } from '../getVectorChainOrder/getVectorChainOrder';

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

  it('should snap to the next segment sample when the target falls between two samples that straddle a segment boundary', () => {
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

    // before — a target length exactly between the two samples straddling the s1/s2 boundary
    const targetLength = (lower.length + upper.length) / 2;
    const position = getVectorChainPositionAtLength(table, targetLength);

    // result
    expect(position).toEqual({ segmentId: upper.segmentId, t: upper.t });
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
