// store
import { getAutoLayoutContentBox } from 'store/design/utils/autoLayout/getAutoLayoutContentBox';
import { getAutoLayoutDraggedBoundingBox } from 'store/design/utils/autoLayout/getAutoLayoutDraggedBoundingBox';
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';
import { getAutoLayoutRotatedPositions } from 'store/design/utils/autoLayout/getAutoLayoutRotatedPositions';
import { getAutoLayoutSingleLineSiblingPositions } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutSingleLineSiblingPositions';
import { getAutoLayoutWrappedSiblingPositions } from 'store/design/utils/autoLayout/getAutoLayoutWrappedDropTarget/getAutoLayoutWrappedSiblingPositions';

// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutDropTargetContext } from './types';
import { TAutoLayoutFrame } from '../types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutFrameDropTarget } from './getAutoLayoutFrameDropTarget';
import { getAutoLayoutSizesById } from './getAutoLayoutSizesById';

const getSiblingPositions = (
  context: TAutoLayoutDropTargetContext,
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  contentBox: TDraftRect,
  index: number,
): Record<string, TPoint> => {
  const input = {
    alignment: context.alignment,
    children: context.siblingSizes,
    contentBox,
    counterAxisSpacing: context.counterAxisSpacing,
    draggedSizes: [],
    index,
    itemSpacing: context.itemSpacing,
    layoutMode,
  };

  return context.isWrapEnabled ? getAutoLayoutWrappedSiblingPositions(input) : getAutoLayoutSingleLineSiblingPositions(input);
};

export const armAutoLayoutFloatingReorderPreview = (
  canvasRefs: TCanvasRefs,
  desiredParent: TAutoLayoutFrame,
  desiredParentId: string,
  selectedNodes: TSceneNode[],
  point: TPoint,
  context: TAutoLayoutDropTargetContext,
): void => {
  const draggedSize = getAutoLayoutDraggedBoundingBox(selectedNodes, desiredParent);
  const dropTarget = getAutoLayoutFrameDropTarget(desiredParent, context, draggedSize, point);
  const contentBox = getAutoLayoutContentBox(desiredParent, context.padding);
  const siblingPositions = getSiblingPositions(context, desiredParent.layoutMode, contentBox, dropTarget.index);
  const frameCenter = getAutoLayoutFrameCenter(desiredParent);

  canvasRefs.transform.autoLayoutDropTargetRef.current = { frameId: desiredParentId, ...dropTarget };
  canvasRefs.transform.autoLayoutReorderPreviewRef.current = {
    activeIndex: dropTarget.index,
    frameId: desiredParentId,
    positions: getAutoLayoutRotatedPositions(
      siblingPositions,
      getAutoLayoutSizesById(context.siblingSizes),
      frameCenter,
      desiredParent.rotation,
    ),
  };
};
