// store
import { getNodesBoundingBox } from 'store/design/utils/getNodesBoundingBox';

// types
import { TAutoLayoutDropTargetContext } from './types';
import { TAutoLayoutFrame } from '../types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutDropIndicator } from './armAutoLayoutDropIndicator';
import { armAutoLayoutReorderPreview } from './armAutoLayoutReorderPreview';
import { getAutoLayoutFrameDropTarget } from './getAutoLayoutFrameDropTarget';
import { getReorderDraggedBlock } from './getReorderDraggedBlock';
import { getSingleLineReorderDropTarget } from './getSingleLineReorderDropTarget';

export const armAutoLayoutSingleLineDropTarget = (
  canvasRefs: TCanvasRefs,
  desiredParent: TAutoLayoutFrame,
  desiredParentId: string,
  selectedNodes: TSceneNode[],
  grabbedNodeId: string | null,
  point: TPoint,
  context: TAutoLayoutDropTargetContext,
): void => {
  const draggedSize = getNodesBoundingBox(selectedNodes);
  const dropTarget = getAutoLayoutFrameDropTarget(
    desiredParent,
    context.itemSpacing,
    context.counterAxisSpacing,
    context.alignment,
    context.padding,
    context.siblingSizes,
    context.realPositions,
    context.originalIndex,
    draggedSize,
    context.draggedSizes,
    point,
  );

  if (context.isSameParentReorder) {
    const reorderDropTarget = getSingleLineReorderDropTarget(
      dropTarget,
      desiredParent,
      context.itemSpacing,
      context.alignment,
      context.padding,
      context.siblingSizes,
      context.draggedSizes,
      context.orderedMovedIds,
    );
    const draggedBlock = getReorderDraggedBlock(
      desiredParent,
      context.itemSpacing,
      context.alignment,
      context.padding,
      context.siblingSizes,
      reorderDropTarget.index,
      context.draggedSizes,
      context.orderedMovedIds,
      grabbedNodeId,
    );

    armAutoLayoutReorderPreview(canvasRefs, desiredParentId, reorderDropTarget, context.siblingEntries, draggedBlock);
  } else {
    armAutoLayoutDropIndicator(canvasRefs, desiredParentId, dropTarget);
  }
};
