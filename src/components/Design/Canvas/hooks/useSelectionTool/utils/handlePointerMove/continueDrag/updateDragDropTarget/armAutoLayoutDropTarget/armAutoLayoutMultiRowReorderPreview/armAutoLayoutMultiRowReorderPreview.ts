// store
import { getAutoLayoutContentBox, TAutoLayoutPadding } from 'store/design/utils/autoLayout/getAutoLayoutContentBox';
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';
import { getAutoLayoutReadingOrderSlot } from 'store/design/utils/autoLayout/getAutoLayoutReadingOrderSlot/getAutoLayoutReadingOrderSlot';
import { getAutoLayoutRotatedPositions } from 'store/design/utils/autoLayout/getAutoLayoutRotatedPositions';
import { getAutoLayoutWrappedSiblingPositions } from 'store/design/utils/autoLayout/getAutoLayoutWrappedDropTarget/getAutoLayoutWrappedSiblingPositions';

// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAutoLayoutFrame } from '../../types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutReorderPreview } from '../armAutoLayoutReorderPreview';
import { clamp } from 'utils/math/clamp';
import { getAutoLayoutChildBounds } from './getAutoLayoutChildBounds';
import { getAutoLayoutSizesById } from '../getAutoLayoutSizesById';
import { getAutoLayoutWorldDraggedBlock } from '../getAutoLayoutWorldDraggedBlock';
import { getDraggedBlockPreviewMeta } from '../getDraggedBlockPreviewMeta';
import { getMemberSlots } from './getMemberSlots';
import { isAutoLayoutFlowChild } from 'utils/canvas/signals/isAutoLayoutFlowChild';

export const armAutoLayoutMultiRowReorderPreview = (
  canvasRefs: TCanvasRefs,
  desiredParent: TAutoLayoutFrame,
  desiredParentId: string,
  nodesById: Record<string, TSceneNode>,
  siblingEntries: { bounds: TDraftRect; sibling: TSceneNode }[],
  siblingSizes: TAutoLayoutChildSize[],
  itemSpacing: number,
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  padding: TAutoLayoutPadding,
  draggedSizes: TAutoLayoutChildSize[],
  orderedMovedIds: string[],
  grabbedNodeId: string | null,
  point: TPoint,
): void => {
  const isHorizontal = desiredParent.layoutMode === LayoutMode.horizontal;
  const flowChildIds = desiredParent.childIds.filter((id) => isAutoLayoutFlowChild(id, nodesById));
  const childBounds = getAutoLayoutChildBounds(flowChildIds, nodesById, desiredParent);
  const grabbedIndexInBlock = Math.max(0, orderedMovedIds.indexOf(grabbedNodeId ?? ''));
  const readingOrderSlot = getAutoLayoutReadingOrderSlot(isHorizontal, childBounds, point);
  const isChasm = readingOrderSlot - grabbedIndexInBlock > siblingSizes.length;
  const index = clamp(readingOrderSlot - grabbedIndexInBlock, 0, siblingSizes.length);
  const contentBox = getAutoLayoutContentBox(desiredParent, padding);
  const siblingPositions = getAutoLayoutWrappedSiblingPositions({
    alignment,
    children: siblingSizes,
    contentBox,
    counterAxisSpacing,
    draggedSizes,
    index,
    itemSpacing,
    layoutMode: desiredParent.layoutMode,
  });
  const memberSlots = getMemberSlots(
    isChasm,
    isHorizontal,
    desiredParent.layoutMode,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    contentBox,
    siblingSizes,
    index,
    draggedSizes,
  );
  const frameCenter = getAutoLayoutFrameCenter(desiredParent);
  const worldSiblingPositions = getAutoLayoutRotatedPositions(
    siblingPositions,
    getAutoLayoutSizesById(siblingSizes),
    frameCenter,
    desiredParent.rotation,
  );
  const draggedBlock = getDraggedBlockPreviewMeta(
    orderedMovedIds,
    grabbedNodeId,
    memberSlots,
    contentBox,
    frameCenter,
    desiredParent.rotation,
    isChasm,
  );

  armAutoLayoutReorderPreview(
    canvasRefs,
    desiredParentId,
    { index, indicator: { height: 0, width: 0, x: 0, y: 0 }, siblingPositions: worldSiblingPositions },
    siblingEntries,
    getAutoLayoutWorldDraggedBlock(draggedBlock, orderedMovedIds, draggedSizes, frameCenter, desiredParent.rotation),
  );
};
