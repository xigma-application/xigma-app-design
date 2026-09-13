// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridAutoPlacementFreezeAnchors } from '../getGridAutoPlacementFreezeAnchors';

const frame = (childIds: string[], overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds,
  clipContent: true,
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
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

describe('getGridAutoPlacementFreezeAnchors', () => {
  it('should return an empty list for an empty grid', () => {
    expect(getGridAutoPlacementFreezeAnchors(frame([]), {})).toEqual([]);
  });

  it('should stamp each auto-flowed child’s current cell as an explicit anchor', () => {
    const nodes = byId([child('a'), child('b'), child('c')]);

    expect(getGridAutoPlacementFreezeAnchors(frame(['a', 'b', 'c']), nodes)).toEqual([
      { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0, id: 'a' },
      { gridColumnAnchorIndex: 1, gridRowAnchorIndex: 0, id: 'b' },
      { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 1, id: 'c' },
    ]);
  });

  it('should freeze off of the live auto-flow order even when a stale anchor is already present on a child', () => {
    // a leftover anchor from a previous manual session shouldn't change where freezing pins it —
    // freezing always reads the current, auto-computed layout (auto-flow ignores stale anchors)
    const nodes = byId([child('a'), child('b', { gridColumnAnchorIndex: 5, gridRowAnchorIndex: 5 } as Partial<TSceneNode>)]);

    expect(getGridAutoPlacementFreezeAnchors(frame(['a', 'b']), nodes)).toEqual([
      { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0, id: 'a' },
      { gridColumnAnchorIndex: 1, gridRowAnchorIndex: 0, id: 'b' },
    ]);
  });

  it('should respect the frame’s column count when wrapping to the next row', () => {
    const nodes = byId([child('a'), child('b'), child('c'), child('d')]);

    expect(getGridAutoPlacementFreezeAnchors(frame(['a', 'b', 'c', 'd'], { gridColumnCount: 3 }), nodes)).toEqual([
      { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0, id: 'a' },
      { gridColumnAnchorIndex: 1, gridRowAnchorIndex: 0, id: 'b' },
      { gridColumnAnchorIndex: 2, gridRowAnchorIndex: 0, id: 'c' },
      { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 1, id: 'd' },
    ]);
  });
});
