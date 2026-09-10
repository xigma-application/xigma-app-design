// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridTrackLayout } from '../../getGridTrackLayout';

// utils
import { resolveGridDropHover } from '../resolveGridDropHover';

const layout = (overrides: Partial<TGridTrackLayout> = {}): TGridTrackLayout => ({
  columnCount: 2,
  columnGap: 0,
  columnSize: 100,
  padding: { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
  rowCount: 2,
  rowGap: 0,
  rowSize: 100,
  ...overrides,
});

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

describe('resolveGridDropHover', () => {
  it('should highlight the hovered cell when it is empty', () => {
    expect(resolveGridDropHover(frame(), {}, [], { x: 50, y: 50 }, layout())).toEqual({ cells: [{ column: 0, row: 0 }] });
  });

  it('should fall back to the origin when the track geometry is degenerate', () => {
    expect(resolveGridDropHover(frame(), {}, [], { x: 50, y: 50 }, layout({ columnSize: 0 }))).toEqual({
      cells: [{ column: 0, row: 0 }],
    });
  });

  it('should delegate to the occupied-cell resolver, dropping a reading-order indicator on a plain cell', () => {
    const nodes = byId([anchored('a', 0, 0), anchored('b', 1, 0)]);

    expect(resolveGridDropHover(frame({ childIds: ['a', 'b'] }), nodes, [], { x: 80, y: 50 }, layout())).toEqual({
      cells: [],
      indicator: { column: 0, row: 0, side: 'right' },
      insertIndex: 1,
    });
  });

  it('should send a hover inside a multi-cell child to the next free cell, not an interior indicator', () => {
    const nodes = byId([anchored('a', 0, 0, 2, 2)]);
    const wide = layout({ columnCount: 3, rowCount: 2 });

    expect(resolveGridDropHover(frame({ childIds: ['a'], gridColumnCount: 3 }), nodes, [], { x: 50, y: 50 }, wide)).toEqual({
      cells: [{ column: 2, row: 0 }],
    });
  });

  it('should auto-flow the occupancy scan when the frame still places automatically', () => {
    const nodes = byId([anchored('a', 0, 0)]);

    expect(resolveGridDropHover(frame({ childIds: ['a'], gridAutoPlacement: undefined }), nodes, [], { x: 20, y: 50 }, layout())).toEqual({
      cells: [],
      indicator: { column: 0, row: 0, side: 'left' },
      insertIndex: 0,
    });
  });
});
