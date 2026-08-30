// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getDashedVectorPathVertices } from '../getDashedVectorPathVertices';
import { getVectorChainArcLengthTable, TVectorChainArcLengthSample } from '../../../vectorNetwork/getVectorChainArcLengthTable';
import { getVectorChainOrder } from '../../../vectorNetwork/getVectorChainOrder/getVectorChainOrder';

const DASH_LENGTH_PX = 8;
const DASH_GAP_PX = 6;

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

// a straight 200-unit horizontal segment
const straightNode: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: seg('s1', 'a', 'b') },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 200, y: 0 } },
};

const buildTable = (node: TVectorNode): { table: TVectorChainArcLengthSample[]; totalLength: number } => {
  const chainOrder = getVectorChainOrder(node)!;
  const table = getVectorChainArcLengthTable(node, chainOrder);

  return { table, totalLength: table[table.length - 1].length };
};

const expectedDashCount = (totalLength: number, zoom: number): number => {
  const patternLength = (DASH_LENGTH_PX + DASH_GAP_PX) / zoom;

  return Math.max(1, Math.round(totalLength / patternLength));
};

describe('getDashedVectorPathVertices', () => {
  it('should return 4 numbers (one x/y pair per endpoint) for each dash', () => {
    // mock
    const { table, totalLength } = buildTable(straightNode);

    // action
    const result = getDashedVectorPathVertices(straightNode, table, totalLength, 1, DASH_LENGTH_PX, DASH_GAP_PX);

    // result
    expect(result).toHaveLength(expectedDashCount(totalLength, 1) * 4);
  });

  it('should double the dash count when zoomed in 2x, keeping each dash a constant size on screen', () => {
    // mock
    const { table, totalLength } = buildTable(straightNode);

    // action
    const resultAt1x = getDashedVectorPathVertices(straightNode, table, totalLength, 1, DASH_LENGTH_PX, DASH_GAP_PX);
    const resultAt2x = getDashedVectorPathVertices(straightNode, table, totalLength, 2, DASH_LENGTH_PX, DASH_GAP_PX);

    // result
    expect(resultAt2x.length).toBeGreaterThan(resultAt1x.length);
    expect(resultAt2x).toHaveLength(expectedDashCount(totalLength, 2) * 4);
  });

  it('should leave gaps between dashes instead of tracing a continuous line', () => {
    // mock — the chain's own start point is (0,0)
    const { table, totalLength } = buildTable(straightNode);

    // action
    const result = getDashedVectorPathVertices(straightNode, table, totalLength, 1, DASH_LENGTH_PX, DASH_GAP_PX);

    // result
    expect(result[0]).toBeCloseTo(0);
    expect(result[1]).toBeCloseTo(0);

    const dashEnd = { x: result[2], y: result[3] };
    const nextDashStart = { x: result[4], y: result[5] };

    expect(dashEnd).not.toEqual(nextDashStart);
  });

  it('should always draw at least one dash, even when the chain is shorter than a single dash+gap cycle', () => {
    // mock — a tiny 4-unit segment, well under one (8+6) pattern length
    const tinyNode: TVectorNode = {
      ...straightNode,
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 4, y: 0 } },
    };
    const { table, totalLength } = buildTable(tinyNode);

    // action
    const result = getDashedVectorPathVertices(tinyNode, table, totalLength, 1, DASH_LENGTH_PX, DASH_GAP_PX);

    // result
    expect(result).toHaveLength(4);
  });

  it('should resolve dash endpoints against the given (already rotated/baked) node geometry', () => {
    // mock — a 200-unit horizontal segment rotated 90deg around its own bounds center (100, 0)
    const rotatedNode: TVectorNode = { ...straightNode, rotation: 90 };
    const { table, totalLength } = buildTable(rotatedNode);

    // action
    const result = getDashedVectorPathVertices(rotatedNode, table, totalLength, 1, DASH_LENGTH_PX, DASH_GAP_PX);

    // result — the caller is expected to have already rotated the node before building the table;
    // this function itself performs no rotation, it only walks the segment it's handed
    expect(result[0]).toBeCloseTo(0);
    expect(result[1]).toBeCloseTo(0);
  });
});
