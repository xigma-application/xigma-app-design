// store
import { getAutoLayoutDraggedBoundingBox } from 'store/design/utils/autoLayout/getAutoLayoutDraggedBoundingBox';
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';

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
import { getAutoLayoutWorldDraggedBlock } from './getAutoLayoutWorldDraggedBlock';
import { getAutoLayoutWorldDropTarget } from './getAutoLayoutWorldDropTarget';
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
  const draggedSize = getAutoLayoutDraggedBoundingBox(selectedNodes, desiredParent);
  const dropTarget = getAutoLayoutFrameDropTarget(desiredParent, context, draggedSize, point);

  if (context.isSameParentReorder) {
    const reorderDropTarget = getSingleLineReorderDropTarget(
      dropTarget,
      desiredParent,
      context.itemSpacing,
      context.counterAxisSpacing,
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
    const frameCenter = getAutoLayoutFrameCenter(desiredParent);
    const worldReorderDropTarget = getAutoLayoutWorldDropTarget(
      reorderDropTarget,
      context.siblingSizes,
      frameCenter,
      desiredParent.rotation,
    );
    const worldDraggedBlock = getAutoLayoutWorldDraggedBlock(
      draggedBlock,
      context.orderedMovedIds,
      context.draggedSizes,
      frameCenter,
      desiredParent.rotation,
    );

    armAutoLayoutReorderPreview(canvasRefs, desiredParentId, worldReorderDropTarget, context.siblingEntries, worldDraggedBlock);
  } else {
    armAutoLayoutDropIndicator(canvasRefs, desiredParentId, dropTarget);
  }
};
