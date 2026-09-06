// types
import { AlignmentLayout, LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutDropTarget } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutDropTarget';
import { TAutoLayoutFrame } from '../../types';

// utils
import { getSingleLineReorderDropTarget } from '../getSingleLineReorderDropTarget';

const frame: TAutoLayoutFrame = {
  childIds: ['1', '2', '3', '4'],
  clipContent: true,
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 600,
  x: 0,
  y: 0,
};
const NO_PADDING = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };
const siblingSizes = [
  { height: 100, id: '2', width: 100 },
  { height: 100, id: '3', width: 100 },
];
const draggedSizes = [
  { height: 100, id: '__dragged__', width: 100 },
  { height: 100, id: '__dragged__', width: 100 },
];
const baseDropTarget: TAutoLayoutDropTarget = {
  index: 0,
  indicator: { height: 0, width: 0, x: 0, y: 0 },
  siblingPositions: { 2: { x: 999, y: 999 }, 3: { x: 999, y: 999 } },
};

describe('getSingleLineReorderDropTarget', () => {
  it('recomputes sibling positions from the block’s individual members for a multi-node reorder', () => {
    // action
    const result = getSingleLineReorderDropTarget(
      baseDropTarget,
      frame,
      0,
      0,
      AlignmentLayout.topLeft,
      NO_PADDING,
      siblingSizes,
      draggedSizes,
      ['1', '4'],
    );

    // result — index untouched, siblings make room for two 100px members only
    expect(result).toEqual({
      index: 0,
      indicator: { height: 0, width: 0, x: 0, y: 0 },
      siblingPositions: { 2: { x: 200, y: 0 }, 3: { x: 300, y: 0 } },
    });
  });

  it('passes a single-node reorder through untouched', () => {
    // action
    const result = getSingleLineReorderDropTarget(
      baseDropTarget,
      frame,
      0,
      0,
      AlignmentLayout.topLeft,
      NO_PADDING,
      siblingSizes,
      [draggedSizes[0]],
      ['1'],
    );

    // result
    expect(result).toBe(baseDropTarget);
  });
});
