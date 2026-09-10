// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridInsertPlacements } from '../getGridInsertPlacements';

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

const byId = (nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

describe('getGridInsertPlacements', () => {
  it('should lay the dragged nodes out in reading order from the insert index, with nothing to shift on an empty grid', () => {
    // action
    const { dragged, shifted } = getGridInsertPlacements(frame(), {}, ['d1', 'd2'], 0);

    // result
    expect(dragged).toEqual([
      { column: 0, row: 0 },
      { column: 1, row: 0 },
    ]);
    expect(shifted).toEqual([]);
  });

  it('should push existing children at or after the insert index down, leaving earlier ones in place', () => {
    // mock — two children sitting at reading indices 0 and 1 of a 2-column grid
    const nodes = byId([anchored('a', 0, 0), anchored('b', 1, 0)]);

    // action — insert one dragged node at reading index 1
    const { dragged, shifted } = getGridInsertPlacements(frame({ childIds: ['a', 'b'] }), nodes, ['d1'], 1);

    // result — "a" stays, "b" slides into the next row
    expect(dragged).toEqual([{ column: 1, row: 0 }]);
    expect(shifted).toEqual([{ cell: { column: 0, row: 1 }, id: 'b' }]);
  });

  it('should keep an existing child in its own later cell when that is already past the freed run', () => {
    // mock — childIds deliberately out of reading order so the reading-order sort has to reorder them
    const nodes = byId([anchored('a', 0, 0), anchored('c', 0, 2)]);

    // action
    const { shifted } = getGridInsertPlacements(frame({ childIds: ['c', 'a'] }), nodes, ['d1'], 1);

    // result — "c" was already at reading index 4, further than the freed slot, so it stays there
    expect(shifted).toEqual([{ cell: { column: 0, row: 2 }, id: 'c' }]);
  });

  it('should treat an empty dragged selection as one cell and a missing column count as a single column', () => {
    // action
    const { dragged, shifted } = getGridInsertPlacements(frame({ gridAutoPlacement: undefined, gridColumnCount: undefined }), {}, [], 0);

    // result
    expect(dragged).toEqual([{ column: 0, row: 0 }]);
    expect(shifted).toEqual([]);
  });
});
