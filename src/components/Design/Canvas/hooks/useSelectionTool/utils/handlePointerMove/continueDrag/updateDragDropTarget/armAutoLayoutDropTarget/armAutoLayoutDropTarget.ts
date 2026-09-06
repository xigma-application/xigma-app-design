// types
import { TAutoLayoutFrame } from '../types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutMultiRowReorderPreview } from './armAutoLayoutMultiRowReorderPreview/armAutoLayoutMultiRowReorderPreview';
import { armAutoLayoutSingleLineDropTarget } from './armAutoLayoutSingleLineDropTarget';
import { getAutoLayoutDropTargetContext } from './getAutoLayoutDropTargetContext';

export const armAutoLayoutDropTarget = (
  canvasRefs: TCanvasRefs,
  desiredParent: TAutoLayoutFrame,
  desiredParentId: string,
  currentParentId: string | null,
  selectedNodes: TSceneNode[],
  movedNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
  point: TPoint,
  grabbedNodeId: string | null,
): void => {
  const context = getAutoLayoutDropTargetContext(desiredParent, desiredParentId, currentParentId, selectedNodes, movedNodeIds, nodesById);
  const isMultiRowReorder = context.isSameParentReorder && context.isWrapEnabled && context.orderedMovedIds.length > 1;

  if (isMultiRowReorder) {
    armAutoLayoutMultiRowReorderPreview(
      canvasRefs,
      desiredParent,
      desiredParentId,
      nodesById,
      context.siblingEntries,
      context.siblingSizes,
      context.itemSpacing,
      context.counterAxisSpacing,
      context.alignment,
      context.padding,
      context.draggedSizes,
      context.orderedMovedIds,
      grabbedNodeId,
      point,
    );
  } else {
    armAutoLayoutSingleLineDropTarget(canvasRefs, desiredParent, desiredParentId, selectedNodes, grabbedNodeId, point, context);
  }
};
