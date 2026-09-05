// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutSiblingEntries } from '../getAutoLayoutSiblingEntries';

const frame = (childIds: string[]): TFrameNode => ({
  childIds,
  clipContent: true,
  fill: '#fff',
  height: 300,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
});

const rect = (id: string, x: number, y: number): TSceneNode =>
  ({
    fill: '#000',
    height: 20,
    id,
    name: 'Rectangle',
    parentId: 'frame-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 20,
    x,
    y,
  }) as TSceneNode;

describe('getAutoLayoutSiblingEntries', () => {
  it('should return the axis-aligned bounds and node for each remaining child', () => {
    // mock
    const siblingA = rect('a', 10, 20);
    const siblingB = rect('b', 50, 60);
    const nodesById = { a: siblingA, b: siblingB };

    // action
    const entries = getAutoLayoutSiblingEntries(frame(['a', 'b']), [], nodesById);

    // result
    expect(entries).toEqual([
      { bounds: { height: 20, width: 20, x: 10, y: 20 }, sibling: siblingA },
      { bounds: { height: 20, width: 20, x: 50, y: 60 }, sibling: siblingB },
    ]);
  });

  it('should exclude a child that is part of the moved node set', () => {
    // mock
    const draggedSibling = rect('dragged', 0, 0);
    const remainingSibling = rect('remaining', 40, 0);
    const nodesById = { dragged: draggedSibling, remaining: remainingSibling };

    // action
    const entries = getAutoLayoutSiblingEntries(frame(['dragged', 'remaining']), ['dragged'], nodesById);

    // result
    expect(entries.map(({ sibling }) => sibling.id)).toEqual(['remaining']);
  });

  it('should skip a childId that no longer resolves to a node', () => {
    // mock
    const nodesById = { a: rect('a', 0, 0) };

    // action
    const entries = getAutoLayoutSiblingEntries(frame(['a', 'stale']), [], nodesById);

    // result
    expect(entries.map(({ sibling }) => sibling.id)).toEqual(['a']);
  });
});
