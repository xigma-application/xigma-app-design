// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridDropContext } from '../types';

// utils
import { getGridOccupancyIndex } from '../getGridOccupancyIndex';

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

const context = (overrides: Partial<TGridDropContext> = {}): TGridDropContext => ({
  count: 1,
  frame: frame(),
  movedNodeIds: [],
  nodesById: {},
  ...overrides,
});

describe('getGridOccupancyIndex', () => {
  it('should mark every cell a placed child occupies', () => {
    const nodes = byId([anchored('a', 0, 0)]);

    const index = getGridOccupancyIndex(context({ frame: frame({ childIds: ['a'] }), nodesById: nodes }), 2);

    expect(index.occupied.has('0:0')).toBe(true);
    expect(index.occupied.has('0:1')).toBe(false);
  });

  it('should mark every cell of a multi-span child as owned by that same placement', () => {
    const nodes = byId([anchored('a', 0, 0, 2, 2)]);

    const index = getGridOccupancyIndex(context({ frame: frame({ childIds: ['a'] }), nodesById: nodes }), 2);

    expect(index.cellOwner.get('0:0')?.id).toBe('a');
    expect(index.cellOwner.get('0:1')?.id).toBe('a');
    expect(index.cellOwner.get('1:0')?.id).toBe('a');
    expect(index.cellOwner.get('1:1')?.id).toBe('a');
  });

  it('should exclude the moved node ids from the occupancy scan', () => {
    const nodes = byId([anchored('a', 0, 0)]);

    const index = getGridOccupancyIndex(context({ frame: frame({ childIds: ['a'] }), movedNodeIds: ['a'], nodesById: nodes }), 2);

    expect(index.occupied.size).toBe(0);
  });

  it('should return an empty index for an empty grid', () => {
    const index = getGridOccupancyIndex(context(), 2);

    expect(index.occupied.size).toBe(0);
    expect(index.cellOwner.size).toBe(0);
  });
});
