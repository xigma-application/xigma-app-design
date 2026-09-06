// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TAutoLayoutFrame } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutDropTargetContext } from '../getAutoLayoutDropTargetContext';

const autoLayoutFrame: TAutoLayoutFrame = {
  childIds: ['a', 'b', 'c'],
  clipContent: true,
  fill: '#fff',
  height: 300,
  id: 'frame-1',
  layoutMode: LayoutMode.vertical,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

const node = (id: string, x: number, y: number): TSceneNode =>
  ({
    fill: '#000',
    height: 20,
    id,
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 20,
    x,
    y,
  }) as TSceneNode;

const nodesById = { a: node('a', 0, 0), b: node('b', 0, 40), c: node('c', 0, 80) };

describe('getAutoLayoutDropTargetContext', () => {
  it('flags a same-parent reorder and orders the moved ids by their position in childIds', () => {
    // action
    const context = getAutoLayoutDropTargetContext(
      autoLayoutFrame,
      'frame-1',
      'frame-1',
      [nodesById.c, nodesById.b],
      ['c', 'b'],
      nodesById,
      false,
    );

    // result
    expect(context.isSameParentReorder).toBe(true);
    expect(context.originalIndex).toBe(1);
    expect(context.orderedMovedIds).toEqual(['b', 'c']);
  });

  it('treats a drop into another parent as a plain insert — no original index, moved ids left as given', () => {
    // action
    const context = getAutoLayoutDropTargetContext(
      autoLayoutFrame,
      'frame-1',
      null,
      [nodesById.c, nodesById.b],
      ['c', 'b'],
      nodesById,
      false,
    );

    // result
    expect(context.isSameParentReorder).toBe(false);
    expect(context.originalIndex).toBeNull();
    expect(context.orderedMovedIds).toEqual(['c', 'b']);
  });

  it('treats even a same-parent drop as a plain insert when same-parent reorder is suppressed (modifier held / abandoned)', () => {
    // action — desiredParentId === currentParentId, but the caller wants the basic drop-indicator flow
    const context = getAutoLayoutDropTargetContext(
      autoLayoutFrame,
      'frame-1',
      'frame-1',
      [nodesById.c, nodesById.b],
      ['c', 'b'],
      nodesById,
      true,
    );

    // result
    expect(context.isSameParentReorder).toBe(false);
    expect(context.originalIndex).toBeNull();
  });

  it('spaces siblings with the frame’s own axis gap, falling back to 0 and to the item spacing on the counter axis', () => {
    // action
    const noGaps = getAutoLayoutDropTargetContext(autoLayoutFrame, 'frame-1', null, [nodesById.a], ['a'], nodesById, false);
    const horizontalGap = getAutoLayoutDropTargetContext(
      { ...autoLayoutFrame, horizontalGap: 50, layoutMode: LayoutMode.horizontal },
      'frame-1',
      null,
      [nodesById.a],
      ['a'],
      nodesById,
      false,
    );

    // result
    expect(noGaps.itemSpacing).toBe(0);
    expect(noGaps.counterAxisSpacing).toBe(0);
    expect(horizontalGap.itemSpacing).toBe(50);
    expect(horizontalGap.counterAxisSpacing).toBe(50);
  });

  it('enables the wrap path only when layoutWrap is set and the primary axis is not hugging', () => {
    // action
    const wrapped = getAutoLayoutDropTargetContext(
      { ...autoLayoutFrame, layoutWrap: true },
      'frame-1',
      null,
      [nodesById.a],
      ['a'],
      nodesById,
      false,
    );
    const huggedWrap = getAutoLayoutDropTargetContext(
      { ...autoLayoutFrame, layoutWrap: true, primaryAxisSizingMode: SizingMode.hug },
      'frame-1',
      null,
      [nodesById.a],
      ['a'],
      nodesById,
      false,
    );

    // result
    expect(wrapped.isWrapEnabled).toBe(true);
    expect(huggedWrap.isWrapEnabled).toBe(false);
  });
});
