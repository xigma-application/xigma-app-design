// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { resolveGridTrackAffordanceDragIndices } from '../resolveGridTrackAffordanceDragIndices';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridAutoPlacement: false,
  gridColumnCount: 4,
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

describe('resolveGridTrackAffordanceDragIndices', () => {
  it('should keep the whole current selection when the grabbed index is already part of it', () => {
    const result = resolveGridTrackAffordanceDragIndices(frame(), {}, 'column', 4, [0, 1, 2], 1);

    expect(result).toEqual([0, 1, 2]);
  });

  it('should collapse to a single index when it is not selected and not part of a spanning child', () => {
    const result = resolveGridTrackAffordanceDragIndices(
      frame({ childIds: ['a'] }),
      { a: child('a', { gridColumnAnchorIndex: 0 }) },
      'column',
      4,
      [],
      2,
    );

    expect(result).toEqual([2]);
  });

  it('should collapse to the grabbed track’s full spanning group when it is not yet selected', () => {
    const nodesById = { a: child('a', { gridColumnAnchorIndex: 1, gridColumnSpan: 2 }) };
    const result = resolveGridTrackAffordanceDragIndices(frame({ childIds: ['a'] }), nodesById, 'column', 4, [], 2);

    expect(result).toEqual([1, 2]);
  });

  it('should fall back to a single index when the grabbed index falls outside the computed track groups', () => {
    const result = resolveGridTrackAffordanceDragIndices(frame(), {}, 'column', 4, [], 9);

    expect(result).toEqual([9]);
  });
});
