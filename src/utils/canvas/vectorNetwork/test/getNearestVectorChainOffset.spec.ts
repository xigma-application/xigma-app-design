// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getNearestVectorChainOffset } from '../getNearestVectorChainOffset';
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

describe('getNearestVectorChainOffset', () => {
  it('should return offset 0 and the exact start point for a query directly on the chain start', () => {
    // mock — a(0,0)->b(100,0)
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const chainOrder: TVectorChainOrder = { entries: [{ reversed: false, segmentId: 's1' }], isClosed: false };
    const table = getVectorChainArcLengthTable(node, chainOrder);

    // result
    const nearest = getNearestVectorChainOffset(node, table, { x: 0, y: 0 });

    expect(nearest.offset).toBeCloseTo(0);
    expect(nearest.point).toEqual({ x: 0, y: 0 });
  });

  it('should return offset 0.5 and the midpoint for a query directly on the chain middle', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const chainOrder: TVectorChainOrder = { entries: [{ reversed: false, segmentId: 's1' }], isClosed: false };
    const table = getVectorChainArcLengthTable(node, chainOrder);

    // result
    const nearest = getNearestVectorChainOffset(node, table, { x: 50, y: 0 });

    expect(nearest.offset).toBeCloseTo(0.5, 2);
    expect(nearest.point.x).toBeCloseTo(50, 2);
  });

  it('should project a point off the line onto its nearest point on the chain, with a non-zero distance', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const chainOrder: TVectorChainOrder = { entries: [{ reversed: false, segmentId: 's1' }], isClosed: false };
    const table = getVectorChainArcLengthTable(node, chainOrder);

    // result
    const nearest = getNearestVectorChainOffset(node, table, { x: 50, y: 30 });

    expect(nearest.point.y).toBeCloseTo(0, 2);
    expect(nearest.distance).toBeCloseTo(30, 2);
  });

  it('should return offset 0 for a degenerate zero-length chain instead of dividing by zero', () => {
    // mock — a self-closing zero-length segment
    const node = buildNode({ segments: { s1: seg('s1', 'a', 'a') }, vertices: { a: { id: 'a', x: 5, y: 5 } } });
    const chainOrder: TVectorChainOrder = { entries: [{ reversed: false, segmentId: 's1' }], isClosed: true };
    const table = getVectorChainArcLengthTable(node, chainOrder);

    // result
    const nearest = getNearestVectorChainOffset(node, table, { x: 5, y: 5 });

    expect(nearest.offset).toBe(0);
    expect(Number.isFinite(nearest.distance)).toBe(true);
  });
});
