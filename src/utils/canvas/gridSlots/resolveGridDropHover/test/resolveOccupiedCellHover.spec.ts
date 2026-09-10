// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridDropCell } from '../../getGridDropCell';
import { TGridDropContext } from '../types';
import { TGridTrackLayout } from '../../getGridTrackLayout';

// utils
import { getGridOccupancyIndex } from '../getGridOccupancyIndex';
import { resolveOccupiedCellHover } from '../resolveOccupiedCellHover';

const layout = (overrides: Partial<TGridTrackLayout> = {}): TGridTrackLayout => {
  const columnCount = overrides.columnCount ?? 2;
  const rowCount = overrides.rowCount ?? 2;

  return {
    columnCount,
    columnGap: 0,
    columnSizes: new Array<number>(columnCount).fill(100),
    padding: { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
    rowCount,
    rowGap: 0,
    rowSizes: new Array<number>(rowCount).fill(100),
    ...overrides,
  };
};

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridAutoPlacement: false,
  gridColumnCount: 2,
  gridRowCount: 2,
  height: 200,
  id: 'grid-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const anchored = (id: string, column: number, row: number, columnSpan = 1, rowSpan = 1): TSceneNode =>
  ({
    fill: '#000',
    gridColumnAnchorIndex: column,
    gridColumnSpan: columnSpan,
    gridRowAnchorIndex: row,
    gridRowSpan: rowSpan,
    height: 10,
    id,
    name: id,
    parentId: 'grid-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

const byId = (nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

const setup = (
  childIds: string[],
  nodes: TSceneNode[],
  frameOverrides: Partial<TFrameNode> = {},
): { context: TGridDropContext; layout: TGridTrackLayout } => {
  const gridFrame = frame({ childIds, ...frameOverrides });
  const context: TGridDropContext = { count: 1, frame: gridFrame, movedNodeIds: [], nodesById: byId(nodes) };
  const columnCount = Math.max(gridFrame.gridColumnCount ?? 1, 1);

  return { context, layout: layout({ columnCount, rowCount: gridFrame.gridRowCount ?? 2 }) };
};

const run = (
  childIds: string[],
  nodes: TSceneNode[],
  cell: TGridDropCell,
  framePoint: { x: number; y: number },
  frameOverrides: Partial<TFrameNode> = {},
): ReturnType<typeof resolveOccupiedCellHover> => {
  const { context, layout: trackLayout } = setup(childIds, nodes, frameOverrides);
  const occupancy = getGridOccupancyIndex(context, trackLayout.columnCount);

  return resolveOccupiedCellHover(context, trackLayout, framePoint, cell, occupancy);
};

describe('resolveOccupiedCellHover', () => {
  it('should show a left indicator when the occupied cell is against the left wall', () => {
    expect(run(['a'], [anchored('a', 0, 0)], { column: 0, row: 0 }, { x: 20, y: 50 })).toEqual({
      cells: [],
      indicator: { column: 0, row: 0, side: 'left' },
      insertIndex: 0,
    });
  });

  it('should show a left indicator when the cell to the left is also occupied', () => {
    expect(run(['a', 'b'], [anchored('a', 0, 0), anchored('b', 1, 0)], { column: 1, row: 0 }, { x: 120, y: 50 })).toEqual({
      cells: [],
      indicator: { column: 1, row: 0, side: 'left' },
      insertIndex: 1,
    });
  });

  it('should show a right indicator when the cell to the right is occupied', () => {
    expect(run(['a', 'b'], [anchored('a', 0, 0), anchored('b', 1, 0)], { column: 0, row: 0 }, { x: 80, y: 50 })).toEqual({
      cells: [],
      indicator: { column: 0, row: 0, side: 'right' },
      insertIndex: 1,
    });
  });

  it('should highlight the free cell to the right instead of an indicator', () => {
    expect(run(['a'], [anchored('a', 0, 0)], { column: 0, row: 0 }, { x: 80, y: 50 })).toEqual({ cells: [{ column: 1, row: 0 }] });
  });

  it('should highlight the free cell to the left instead of an indicator', () => {
    expect(run(['b'], [anchored('b', 1, 0)], { column: 1, row: 0 }, { x: 120, y: 50 })).toEqual({ cells: [{ column: 0, row: 0 }] });
  });

  it('should resolve to the next free cell when hovering inside a child that spans several cells', () => {
    // 3x2 grid, "a" covers the 2x2 block at (0,0); the right-hand column stays free
    const nodes = [anchored('a', 0, 0, 2, 2)];

    expect(run(['a'], nodes, { column: 0, row: 0 }, { x: 50, y: 50 }, { gridColumnCount: 3 })).toEqual({
      cells: [{ column: 2, row: 0 }],
    });
    expect(run(['a'], nodes, { column: 0, row: 1 }, { x: 50, y: 150 }, { gridColumnCount: 3 })).toEqual({
      cells: [{ column: 2, row: 1 }],
    });
  });
});
