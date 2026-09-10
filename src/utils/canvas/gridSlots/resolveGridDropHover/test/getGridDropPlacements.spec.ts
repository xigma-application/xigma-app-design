// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridDropPlacements } from '../getGridDropPlacements';

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

describe('getGridDropPlacements', () => {
  it('should fill consecutive free cells in reading order from the hovered cell', () => {
    expect(getGridDropPlacements(frame(), {}, [], { column: 0, row: 0 }, 3)).toEqual([
      { column: 0, row: 0 },
      { column: 1, row: 0 },
      { column: 0, row: 1 },
    ]);
  });

  it('should skip cells occupied by other children and grow into a new row', () => {
    // 2x2 grid, bottom row full — dropping three at the top-left cell
    const nodes = byId([anchored('a', 0, 1), anchored('b', 1, 1)]);

    expect(getGridDropPlacements(frame({ childIds: ['a', 'b'] }), nodes, [], { column: 0, row: 0 }, 3)).toEqual([
      { column: 0, row: 0 },
      { column: 1, row: 0 },
      { column: 0, row: 2 },
    ]);
  });

  it('should auto-flow the other children (ignoring their anchors) when the frame still auto-places', () => {
    // gridAutoPlacement unset => anchors ignored, the child sits at (0,0); dropping there moves on
    const nodes = byId([anchored('a', 1, 1)]);

    expect(getGridDropPlacements(frame({ childIds: ['a'], gridAutoPlacement: undefined }), nodes, [], { column: 0, row: 0 }, 2)).toEqual([
      { column: 1, row: 0 },
      { column: 0, row: 1 },
    ]);
  });

  it('should ignore the dragged nodes themselves when scoring occupancy', () => {
    const nodes = byId([anchored('a', 0, 1), anchored('b', 1, 1)]);

    expect(getGridDropPlacements(frame({ childIds: ['a', 'b'] }), nodes, ['a', 'b'], { column: 0, row: 1 }, 2)).toEqual([
      { column: 0, row: 1 },
      { column: 1, row: 1 },
    ]);
  });

  it('should clamp the start column into range and count from there', () => {
    expect(getGridDropPlacements(frame({ gridColumnCount: 3 }), {}, [], { column: 9, row: 0 }, 1)).toEqual([{ column: 2, row: 0 }]);
  });

  it('should always resolve at least one cell', () => {
    expect(getGridDropPlacements(frame(), {}, [], { column: 0, row: 0 }, 0)).toEqual([{ column: 0, row: 0 }]);
  });

  it('should treat a missing column count as a single column, stacking cells into rows', () => {
    expect(getGridDropPlacements(frame({ gridColumnCount: undefined }), {}, [], { column: 0, row: 0 }, 2)).toEqual([
      { column: 0, row: 0 },
      { column: 0, row: 1 },
    ]);
  });
});
