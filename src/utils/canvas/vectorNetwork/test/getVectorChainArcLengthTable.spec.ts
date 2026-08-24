// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorChainArcLengthTable } from '../getVectorChainArcLengthTable';
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

describe('getVectorChainArcLengthTable', () => {
  it('should accumulate arc length linearly along a single straight segment', () => {
    // mock — a(0,0)->b(100,0), a straight 100px segment
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const chainOrder: TVectorChainOrder = { entries: [{ reversed: false, segmentId: 's1' }], isClosed: false };

    // before
    const table = getVectorChainArcLengthTable(node, chainOrder);

    // result — first sample at the start (length 0), last sample at the end (length 100)
    expect(table[0]).toEqual({ length: 0, segmentId: 's1', t: 0 });
    expect(table[table.length - 1]).toEqual({ length: 100, segmentId: 's1', t: 1 });
    expect(table.every((sample) => sample.segmentId === 's1')).toBe(true);
  });

  it('should carry cumulative length forward across a segment boundary without double-counting the shared vertex', () => {
    // mock — a(0,0)->b(100,0)->c(100,50), two straight segments sharing vertex b
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 100, y: 50 } },
    });
    const chainOrder: TVectorChainOrder = {
      entries: [
        { reversed: false, segmentId: 's1' },
        { reversed: false, segmentId: 's2' },
      ],
      isClosed: false,
    };

    // before
    const table = getVectorChainArcLengthTable(node, chainOrder);

    // result — total length is 150 (100 + 50), and the vertex b appears exactly once in the table
    expect(table[table.length - 1]).toEqual({ length: 150, segmentId: 's2', t: 1 });
    expect(table.filter((sample) => sample.length === 100)).toHaveLength(1);
  });

  it('should walk a reversed entry back-to-front, still accumulating length correctly', () => {
    // mock — segment stored as b(100,0)->a(0,0), but walked start-to-end as a->b (reversed)
    const node = buildNode({
      segments: { s1: seg('s1', 'b', 'a') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const chainOrder: TVectorChainOrder = { entries: [{ reversed: true, segmentId: 's1' }], isClosed: false };

    // before
    const table = getVectorChainArcLengthTable(node, chainOrder);

    // result — walk starts at the segment's own end (t=1, point a) and finishes at its start (t=0, point b)
    expect(table[0]).toEqual({ length: 0, segmentId: 's1', t: 1 });
    expect(table[table.length - 1]).toEqual({ length: 100, segmentId: 's1', t: 0 });
  });

  it('should insert extra requested t values into the sample set for a segment', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const chainOrder: TVectorChainOrder = { entries: [{ reversed: false, segmentId: 's1' }], isClosed: false };

    // before
    const table = getVectorChainArcLengthTable(node, chainOrder, { s1: [0.37] });

    // result
    const inserted = table.find((sample) => sample.t === 0.37);

    expect(inserted).toEqual({ length: 37, segmentId: 's1', t: 0.37 });
  });

  it('should return a single zero-length sample for a degenerate self-closing segment', () => {
    // mock — a segment whose start and end coincide
    const node = buildNode({ segments: { s1: seg('s1', 'a', 'a') }, vertices: { a: { id: 'a', x: 5, y: 5 } } });
    const chainOrder: TVectorChainOrder = { entries: [{ reversed: false, segmentId: 's1' }], isClosed: true };

    // before
    const table = getVectorChainArcLengthTable(node, chainOrder);

    // result
    expect(table.every((sample) => sample.length === 0)).toBe(true);
  });
});
