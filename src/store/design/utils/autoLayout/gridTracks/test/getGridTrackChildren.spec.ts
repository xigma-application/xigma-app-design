// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridTrackChildren } from '../getGridTrackChildren';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: ['a', 'b'],
  clipContent: true,
  fill: '#fff',
  gridColumnCount: 3,
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

describe('getGridTrackChildren', () => {
  it('should return nothing for an auto-placement grid', () => {
    // before
    const nodesById = { a: child('a', { gridColumnAnchorIndex: 1 }) };

    // result
    expect(getGridTrackChildren(frame({ childIds: ['a'] }), nodesById, 'column')).toEqual([]);
  });

  it('should read the column anchor and span for a manual grid', () => {
    // before
    const nodesById = {
      a: child('a', { gridColumnAnchorIndex: 0, gridColumnSpan: 2 }),
      b: child('b', { gridColumnAnchorIndex: 2 }),
    };

    // result
    expect(getGridTrackChildren(frame({ gridAutoPlacement: false }), nodesById, 'column')).toEqual([
      { anchorIndex: 0, id: 'a', span: 2 },
      { anchorIndex: 2, id: 'b', span: 1 },
    ]);
  });

  it('should read the row anchor and span for a manual grid', () => {
    // before
    const nodesById = { a: child('a', { gridRowAnchorIndex: 1, gridRowSpan: 3 }), b: child('b') };

    // result
    expect(getGridTrackChildren(frame({ gridAutoPlacement: false }), nodesById, 'row')).toEqual([
      { anchorIndex: 1, id: 'a', span: 3 },
      { anchorIndex: undefined, id: 'b', span: 1 },
    ]);
  });
});
