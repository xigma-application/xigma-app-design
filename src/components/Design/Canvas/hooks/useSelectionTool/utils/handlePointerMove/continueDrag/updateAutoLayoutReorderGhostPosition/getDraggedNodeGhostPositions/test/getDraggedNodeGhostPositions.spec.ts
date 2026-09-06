import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TAutoLayoutReorderPreview } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getDraggedNodeGhostPositions } from '../getDraggedNodeGhostPositions';

const node = (id: string, x: number, y: number): TSceneNode =>
  ({ height: 20, id, rotation: 0, type: NodeType.rectangle, width: 20, x, y }) as unknown as TSceneNode;

const previewRef = (value: TAutoLayoutReorderPreview): RefObject<TAutoLayoutReorderPreview | null> => ({ current: value });

describe('getDraggedNodeGhostPositions', () => {
  it('should cursor-track every node and reuse the existing tween when there are no dragged-member slots', () => {
    // mock
    const view = {
      activeIndex: 0,
      draggedOffsetTween: undefined,
      frameId: 'frame-1',
      positions: {},
    } as unknown as TAutoLayoutReorderPreview;

    // before
    const result = getDraggedNodeGhostPositions(previewRef(view), [node('a', 10, 20), node('b', 30, 40)], view, 5, 5);

    // result
    expect(result).toEqual({ positions: { a: { x: 15, y: 25 }, b: { x: 35, y: 45 } }, tween: undefined });
  });

  it('should cursor-track the whole block when the grabbed member is not among the selected nodes', () => {
    // mock
    const view = {
      activeIndex: 4,
      draggedGrabbedId: 'gone',
      draggedMemberSlots: { c: { x: 0, y: 200 }, d: { x: 100, y: 200 } },
      frameId: 'frame-1',
      positions: {},
    } as unknown as TAutoLayoutReorderPreview;

    // before
    const result = getDraggedNodeGhostPositions(previewRef(view), [node('c', 0, 100), node('d', 100, 100)], view, 5, 5);

    // result
    expect(result.positions).toEqual({ c: { x: 5, y: 105 }, d: { x: 105, y: 105 } });
  });

  it('should delegate to the block layout when the grabbed member and its slots are present', () => {
    // mock
    const view = {
      activeIndex: 4,
      draggedGrabbedId: 'c',
      draggedMemberSlots: { c: { x: 0, y: 200 }, d: { x: 100, y: 200 } },
      frameId: 'frame-1',
      positions: {},
    } as unknown as TAutoLayoutReorderPreview;

    // before — 'c' dragged straight down onto its own slot
    const result = getDraggedNodeGhostPositions(previewRef(view), [node('c', 0, 100), node('d', 100, 100)], view, 0, 100);

    // result — 'c' rides the cursor, 'd' sits in its own slot
    expect(result.positions).toEqual({ c: { x: 0, y: 200 }, d: { x: 100, y: 200 } });
  });
});
