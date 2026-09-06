// types
import { AlignmentLayout, LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions';
import { TAutoLayoutDropTargetContext } from '../types';
import { TAutoLayoutFrame } from '../../types';

// utils
import { getAutoLayoutFrameDropTarget } from '../getAutoLayoutFrameDropTarget';

const NO_PADDING = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };

const buildContext = (
  siblingSizes: TAutoLayoutChildSize[],
  draggedSizes: TAutoLayoutChildSize[],
  realPositions: TAutoLayoutChildPosition[] = [],
): TAutoLayoutDropTargetContext => ({
  alignment: AlignmentLayout.topLeft,
  counterAxisSpacing: 20,
  draggedSizes,
  isSameParentReorder: false,
  isWrapEnabled: false,
  itemSpacing: 20,
  orderedMovedIds: [],
  originalIndex: null,
  padding: NO_PADDING,
  realPositions,
  siblingEntries: [],
  siblingSizes,
});

const autoLayoutFrame: TAutoLayoutFrame = {
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 300,
  horizontalGap: 20,
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

describe('getAutoLayoutFrameDropTarget', () => {
  it('should route through the flat (non-wrap) computation when the frame has no wrap enabled', () => {
    // action
    const dropTarget = getAutoLayoutFrameDropTarget(autoLayoutFrame, buildContext([], []), { height: 20, width: 20 }, { x: 10, y: 10 });

    // result
    expect(dropTarget.index).toBe(0);
  });

  it('should route through the wrap-aware computation when the frame has wrap enabled on a non-hugged primary axis', () => {
    // mock — three 100x100 children, 'a'/'b' share row 1, 'c' wraps to row 2
    const wrappedFrame: TAutoLayoutFrame = { ...autoLayoutFrame, height: 400, layoutWrap: true, verticalGap: 20, width: 250 };
    const children = [
      { height: 100, id: 'a', width: 100 },
      { height: 100, id: 'b', width: 100 },
      { height: 100, id: 'c', width: 100 },
    ];

    // action — cursor over row 2
    const dropTarget = getAutoLayoutFrameDropTarget(
      wrappedFrame,
      buildContext(children, [{ height: 100, id: '__dragged__', width: 100 }]),
      { height: 100, width: 100 },
      { x: 20, y: 150 },
    );

    // result — lands in row 2, distinct from what the flat computation would report
    expect(dropTarget.index).toBe(2);
  });

  it('should fall back to the flat computation when wrap is enabled but the primary axis hugs its content', () => {
    // mock — hug on the primary axis disables wrap, mirroring computeAutoLayoutPositions's own
    // wrapEnabled condition
    const huggedWrapFrame: TAutoLayoutFrame = { ...autoLayoutFrame, layoutWrap: true, primaryAxisSizingMode: SizingMode.hug };

    // action
    const dropTarget = getAutoLayoutFrameDropTarget(huggedWrapFrame, buildContext([], []), { height: 20, width: 20 }, { x: 10, y: 10 });

    // result
    expect(dropTarget.index).toBe(0);
  });
});
