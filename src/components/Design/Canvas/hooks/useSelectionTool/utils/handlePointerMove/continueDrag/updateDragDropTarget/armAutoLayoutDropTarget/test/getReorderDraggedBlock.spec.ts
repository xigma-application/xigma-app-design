// types
import { AlignmentLayout, LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutFrame } from '../../types';

// utils
import { getReorderDraggedBlock } from '../getReorderDraggedBlock';

const NO_PADDING = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };

const rowFrame: TAutoLayoutFrame = {
  childIds: ['a', 'b', 'c', 'd'],
  clipContent: true,
  fill: '#fff',
  height: 300,
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 400,
  x: 0,
  y: 0,
};

const siblingSizes = [
  { height: 100, id: 'a', width: 100 },
  { height: 100, id: 'd', width: 100 },
];
const draggedSizes = [
  { height: 100, id: '__dragged__', width: 100 },
  { height: 100, id: '__dragged__', width: 100 },
];

describe('getReorderDraggedBlock', () => {
  it('returns nothing for a single-node reorder', () => {
    // action
    const block = getReorderDraggedBlock(rowFrame, 0, AlignmentLayout.topLeft, NO_PADDING, siblingSizes, 2, draggedSizes, ['b'], 'b');

    // result
    expect(block).toBeUndefined();
  });

  it('resolves the block members’ contiguous slots and names the grabbed member for a multi-node reorder', () => {
    // action
    const block = getReorderDraggedBlock(rowFrame, 0, AlignmentLayout.topLeft, NO_PADDING, siblingSizes, 2, draggedSizes, ['b', 'c'], 'c');

    // result — non-wrap has no "chasm", so never contiguous
    expect(block).toEqual({
      draggedClampBox: { height: 300, width: 400, x: 0, y: 0 },
      draggedContiguous: false,
      draggedGrabbedId: 'c',
      draggedMemberSlots: { b: { x: 200, y: 0 }, c: { x: 300, y: 0 } },
    });
  });
});
