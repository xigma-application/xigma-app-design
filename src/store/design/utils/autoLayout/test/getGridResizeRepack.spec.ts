// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { resolveGridResize } from '../getGridResizeRepack';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridAutoPlacement: false,
  gridColumnCount: 2,
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

const anchored = (id: string, column: number, row: number): TSceneNode =>
  ({
    fill: '#000',
    gridColumnAnchorIndex: column,
    gridRowAnchorIndex: row,
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

const spanned = (id: string, column: number, row: number, columnSpan: number, rowSpan: number): TSceneNode =>
  ({ ...anchored(id, column, row), gridColumnSpan: columnSpan, gridRowSpan: rowSpan }) as TSceneNode;

const byId = (nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

describe('resolveGridResize', () => {
  it('should reject a resize whose capacity falls short of the current children', () => {
    const nodes = byId([
      anchored('a', 0, 0),
      anchored('b', 1, 0),
      anchored('c', 0, 1),
      anchored('d', 1, 1),
      anchored('e', 0, 2),
      anchored('f', 1, 2),
    ]);
    const gridFrame = frame({ childIds: ['a', 'b', 'c', 'd', 'e', 'f'] });

    expect(resolveGridResize(gridFrame, nodes, 1, 1)).toEqual({ ok: false, repacked: [], spanReset: [] });
  });

  it('should skip the capacity check when the caller passes no row cap (rows are Auto)', () => {
    const nodes = byId([anchored('a', 0, 0), anchored('b', 1, 0)]);
    const gridFrame = frame({ childIds: ['a', 'b'], gridAutoPlacement: undefined });

    expect(resolveGridResize(gridFrame, nodes, 1, undefined)).toEqual({ ok: true, repacked: [], spanReset: [] });
  });

  it('should allow the resize and skip repacking entirely when the frame still auto-places', () => {
    const nodes = byId([anchored('a', 0, 0), anchored('b', 1, 0)]);
    const gridFrame = frame({ childIds: ['a', 'b'], gridAutoPlacement: undefined });

    expect(resolveGridResize(gridFrame, nodes, 1, 2)).toEqual({ ok: true, repacked: [], spanReset: [] });
  });

  it('should repack a manually anchored child that no longer fits, leaving an untouched sibling out of the result', () => {
    const nodes = byId([anchored('a', 0, 0), anchored('b', 1, 0)]);
    const gridFrame = frame({ childIds: ['a', 'b'] });

    // capacity is sufficient (1 column x 5 rows) — this exercises the "capped but enough" branch
    expect(resolveGridResize(gridFrame, nodes, 1, 5)).toEqual({
      ok: true,
      repacked: [{ column: 0, id: 'b', row: 1 }],
      spanReset: [],
    });
  });

  it('should treat a missing old column count as a single column when repacking', () => {
    const nodes = byId([anchored('a', 0, 0), anchored('b', 0, 1)]);
    const gridFrame = frame({ childIds: ['a', 'b'], gridColumnCount: undefined });

    // 2 rows stacked in the implicit single column repack cleanly into 2 columns, 1 row
    expect(resolveGridResize(gridFrame, nodes, 2, undefined)).toEqual({
      ok: true,
      repacked: [{ column: 1, id: 'b', row: 0 }],
      spanReset: [],
    });
  });

  it('should leave every child in place when growing the grid needs no repacking', () => {
    const nodes = byId([anchored('a', 0, 0), anchored('b', 1, 0)]);
    const gridFrame = frame({ childIds: ['a', 'b'] });

    expect(resolveGridResize(gridFrame, nodes, 3, undefined)).toEqual({ ok: true, repacked: [], spanReset: [] });
  });

  it('should reassign a child whose row alone changes, distinct from one whose column also changes', () => {
    // 1-column grid: a(0,0), b(0,1), c(0,2) — growing to 2 columns repacks in reading order
    const nodes = byId([anchored('a', 0, 0), anchored('b', 0, 1), anchored('c', 0, 2)]);
    const gridFrame = frame({ childIds: ['a', 'b', 'c'], gridColumnCount: 1 });

    // a stays at (0,0); b moves to (1,0) — column AND row change; c moves to (0,1) — row only
    expect(resolveGridResize(gridFrame, nodes, 2, undefined)).toEqual({
      ok: true,
      repacked: [
        { column: 1, id: 'b', row: 0 },
        { column: 0, id: 'c', row: 1 },
      ],
      spanReset: [],
    });
  });

  it('should report a spanning child in spanReset instead of trying to fit its span into the new grid', () => {
    // b spans 2x2 from (0,0); a naive repack of its span would need to reason about collisions —
    // instead every child is reset to 1x1 before the capacity check and repack even run
    const nodes = byId([spanned('a', 0, 0, 2, 2), anchored('b', 0, 1)]);
    const gridFrame = frame({ childIds: ['a', 'b'], gridAutoPlacement: undefined });

    expect(resolveGridResize(gridFrame, nodes, 2, undefined)).toEqual({ ok: true, repacked: [], spanReset: ['a'] });
  });

  it('should collect every spanning child, whether it spans columns, rows, or both', () => {
    const nodes = byId([spanned('a', 0, 0, 3, 1), spanned('b', 0, 1, 1, 2), anchored('c', 1, 1)]);
    const gridFrame = frame({ childIds: ['a', 'b', 'c'] });

    expect(resolveGridResize(gridFrame, nodes, 2, undefined).spanReset.sort()).toEqual(['a', 'b']);
  });

  it('should not report a rejected resize as needing a span reset, since nothing is committed', () => {
    const nodes = byId([spanned('a', 0, 0, 2, 2), anchored('b', 1, 0), anchored('c', 0, 1)]);
    const gridFrame = frame({ childIds: ['a', 'b', 'c'] });

    expect(resolveGridResize(gridFrame, nodes, 1, 1)).toEqual({ ok: false, repacked: [], spanReset: [] });
  });

  it('should repack a spanning anchored child off its reset 1x1 footprint, not its stale span region', () => {
    // a spans 2x2 at (0,0), b sits at (0,1) — inside a's old span. Reset to 1x1 first, then the
    // reading-order repack into a wider grid lays them out as plain cells side by side.
    const nodes = byId([spanned('a', 0, 0, 2, 2), anchored('b', 0, 1)]);
    const gridFrame = frame({ childIds: ['a', 'b'], gridColumnCount: 1 });

    expect(resolveGridResize(gridFrame, nodes, 2, undefined)).toEqual({
      ok: true,
      repacked: [{ column: 1, id: 'b', row: 0 }],
      spanReset: ['a'],
    });
  });
});
