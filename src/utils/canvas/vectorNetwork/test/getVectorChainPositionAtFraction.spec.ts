// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorChainArcLengthTable } from '../getVectorChainArcLengthTable';
import { getVectorChainPositionAtFraction } from '../getVectorChainPositionAtFraction';
import { TVectorChainOrder } from '../getVectorChainOrder';

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

describe('getVectorChainPositionAtFraction', () => {
  it('should resolve fraction 0 to the exact chain start', () => {
    // mock — a(0,0)->b(100,0)
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const chainOrder: TVectorChainOrder = { entries: [{ reversed: false, segmentId: 's1' }], isClosed: false };

    // result
    expect(getVectorChainPositionAtFraction(node, chainOrder, 0)).toEqual({ segmentId: 's1', t: 0 });
  });

  it('should resolve fraction 1 to the exact chain end', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const chainOrder: TVectorChainOrder = { entries: [{ reversed: false, segmentId: 's1' }], isClosed: false };

    // result
    const position = getVectorChainPositionAtFraction(node, chainOrder, 1);

    expect(position.segmentId).toBe('s1');
    expect(position.t).toBeCloseTo(1, 5);
  });

  it('should linearly interpolate t within a single straight segment', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const chainOrder: TVectorChainOrder = { entries: [{ reversed: false, segmentId: 's1' }], isClosed: false };

    // result
    const position = getVectorChainPositionAtFraction(node, chainOrder, 0.3);

    expect(position.segmentId).toBe('s1');
    expect(position.t).toBeCloseTo(0.3, 5);
  });

  it('should snap to the first sample of the next segment when the target falls between two samples that straddle a segment boundary', () => {
    // mock — a(0,0)->b(10,0)->c(110,0), two straight segments of very different lengths
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 }, c: { id: 'c', x: 110, y: 0 } },
    });
    const chainOrder: TVectorChainOrder = {
      entries: [
        { reversed: false, segmentId: 's1' },
        { reversed: false, segmentId: 's2' },
      ],
      isClosed: false,
    };
    const table = getVectorChainArcLengthTable(node, chainOrder);
    const boundaryIndex = table.findIndex((sample, index) => index > 0 && sample.segmentId !== table[index - 1].segmentId);
    const lower = table[boundaryIndex - 1];
    const upper = table[boundaryIndex];
    const totalLength = table[table.length - 1].length;

    // before — a target length exactly between the two samples straddling the s1/s2 boundary
    const fraction = (lower.length + upper.length) / 2 / totalLength;
    const position = getVectorChainPositionAtFraction(node, chainOrder, fraction);

    // result
    expect(position).toEqual({ segmentId: upper.segmentId, t: upper.t });
  });

  it('should fall back to the lower sample without dividing by zero when two same-segment samples share a length', () => {
    // mock — a self-closing zero-length segment, every sample has the same (zero) length
    const node = buildNode({ segments: { s1: seg('s1', 'a', 'a') }, vertices: { a: { id: 'a', x: 5, y: 5 } } });
    const chainOrder: TVectorChainOrder = { entries: [{ reversed: false, segmentId: 's1' }], isClosed: true };

    // result
    const position = getVectorChainPositionAtFraction(node, chainOrder, 0.5);

    expect(position.segmentId).toBe('s1');
    expect(Number.isFinite(position.t)).toBe(true);
  });
});
