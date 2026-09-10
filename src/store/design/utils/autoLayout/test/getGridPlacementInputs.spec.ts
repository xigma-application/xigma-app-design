// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getGridPlacementInputs } from '../getGridPlacementInputs';

const rect = (id: string, overrides: Partial<TSceneNode> = {}): TSceneNode =>
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

describe('getGridPlacementInputs', () => {
  it('should carry the id and grid anchor / span fields of each box child', () => {
    const nodes = byId([
      rect('a', { gridColumnAnchorIndex: 1, gridColumnSpan: 2, gridRowAnchorIndex: 3, gridRowSpan: 1 } as Partial<TSceneNode>),
    ]);

    expect(getGridPlacementInputs(['a'], nodes)).toEqual([
      { gridColumnAnchorIndex: 1, gridColumnSpan: 2, gridRowAnchorIndex: 3, gridRowSpan: 1, id: 'a' },
    ]);
  });

  it('should leave the grid fields undefined for a non-box child', () => {
    const line: TSceneNode = { id: 'l', name: 'Line', parentId: 'grid-1', stroke: '#000', type: NodeType.line, x1: 0, x2: 1, y1: 0, y2: 0 };

    expect(getGridPlacementInputs(['l'], byId([line]))).toEqual([
      { gridColumnAnchorIndex: undefined, gridColumnSpan: undefined, gridRowAnchorIndex: undefined, gridRowSpan: undefined, id: 'l' },
    ]);
  });

  it('should drop ids that do not resolve, and ids in the exclude set', () => {
    const nodes = byId([rect('a'), rect('b'), rect('c')]);

    expect(getGridPlacementInputs(['a', 'ghost', 'b', 'c'], nodes, new Set(['b'])).map((input) => input.id)).toEqual(['a', 'c']);
  });

  it('should drop a child that opted out of the grid via ignoreAutoLayout, freeing its old cell for occupancy scans', () => {
    const nodes = byId([rect('a'), rect('b', { ignoreAutoLayout: true } as Partial<TSceneNode>)]);

    expect(getGridPlacementInputs(['a', 'b'], nodes).map((input) => input.id)).toEqual(['a']);
  });
});
