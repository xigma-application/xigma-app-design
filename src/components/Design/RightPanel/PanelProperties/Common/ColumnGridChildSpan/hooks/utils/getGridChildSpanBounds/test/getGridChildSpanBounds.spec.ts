// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridChildSpanBounds } from '../getGridChildSpanBounds';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridColumnCount: 4,
  height: 200,
  id: 'grid-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 400,
  x: 0,
  y: 0,
  ...overrides,
});

const child = (id: string, overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fill: '#000',
    height: 10,
    id,
    name: id,
    parentId: 'grid-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const byId = (nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

describe('getGridChildSpanBounds', () => {
  it('should let a lone child span the whole grid', () => {
    const nodes = byId([child('a')]);

    expect(getGridChildSpanBounds(frame({ childIds: ['a'] }), nodes, 'a')).toEqual({ maxColumnSpan: 4, maxRowSpan: 1 });
  });

  it('should stop the column span at the next occupied cell, not the grid edge', () => {
    // 4x1 grid: "a" covers columns 0-1, "b" auto-flows to column 2 -> b can only reach column 3
    const nodes = byId([child('a', { gridColumnSpan: 2 }), child('b')]);

    expect(getGridChildSpanBounds(frame({ childIds: ['a', 'b'] }), nodes, 'b')).toEqual({ maxColumnSpan: 2, maxRowSpan: 1 });
  });

  it('should limit the span to the free run ahead of a manually anchored child', () => {
    const nodes = byId([
      child('a', { gridColumnAnchorIndex: 1, gridRowAnchorIndex: 0 }),
      child('b', { gridColumnAnchorIndex: 3, gridRowAnchorIndex: 0 }),
    ]);
    const gridFrame = frame({ childIds: ['a', 'b'], gridAutoPlacement: false });

    // "b" sits at column 3 with "a" holding column 1 — from column 3 only column 3 itself is free
    expect(getGridChildSpanBounds(gridFrame, nodes, 'b')).toEqual({ maxColumnSpan: 1, maxRowSpan: 1 });

    // "a" at column 1 can grow to column 2 (column 3 is taken by "b"), so 2 columns
    expect(getGridChildSpanBounds(gridFrame, nodes, 'a').maxColumnSpan).toBe(2);
  });

  it('should measure the row run down to the effective row count', () => {
    const nodes = byId([child('a'), child('b'), child('c')]);
    const gridFrame = frame({ childIds: ['a', 'b', 'c'], gridColumnCount: 1 });

    // a 1-column grid stacks a/b/c on rows 0/1/2 — "a" is blocked downward by "b" on row 1
    expect(getGridChildSpanBounds(gridFrame, nodes, 'a')).toEqual({ maxColumnSpan: 1, maxRowSpan: 1 });
    // "c" on the last row can span the rows it has: just its own
    expect(getGridChildSpanBounds(gridFrame, nodes, 'c').maxRowSpan).toBe(1);
  });

  it('should block a row span when any cell across the child’s width is taken on the row below', () => {
    // 2x2 grid:  [ a a ]
    //            [ o b ]
    // "a" spans row 0; growing it to 2 rows would need (1,0) AND (1,1) — (1,1) holds "b"
    const nodes = byId([
      child('a', { gridColumnAnchorIndex: 0, gridColumnSpan: 2, gridRowAnchorIndex: 0 }),
      child('b', { gridColumnAnchorIndex: 1, gridRowAnchorIndex: 1 }),
    ]);
    const gridFrame = frame({ childIds: ['a', 'b'], gridAutoPlacement: false, gridColumnCount: 2 });

    expect(getGridChildSpanBounds(gridFrame, nodes, 'a')).toEqual({ maxColumnSpan: 2, maxRowSpan: 1 });
  });

  it('should honour an explicit fixed row count for the row run', () => {
    const nodes = byId([child('a')]);

    expect(getGridChildSpanBounds(frame({ childIds: ['a'], gridColumnCount: 2, gridRowCount: 3 }), nodes, 'a')).toEqual({
      maxColumnSpan: 2,
      maxRowSpan: 3,
    });
  });

  it('should fall back to 1x1 when the node is not among the placed children', () => {
    const nodes = byId([child('a')]);

    expect(getGridChildSpanBounds(frame({ childIds: ['a'] }), nodes, 'ghost')).toEqual({ maxColumnSpan: 1, maxRowSpan: 1 });
  });

  it('should treat a missing column count as a single column', () => {
    const nodes = byId([child('a')]);

    expect(getGridChildSpanBounds(frame({ childIds: ['a'], gridColumnCount: undefined }), nodes, 'a')).toEqual({
      maxColumnSpan: 1,
      maxRowSpan: 1,
    });
  });
});
