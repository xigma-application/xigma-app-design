// types
import { TAutoLayoutFrame } from '../types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutFloatingReorderPreview } from './armAutoLayoutFloatingReorderPreview';
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
  suppressSameParentReorder: boolean,
): void => {
  const context = getAutoLayoutDropTargetContext(
    desiredParent,
    desiredParentId,
    currentParentId,
    selectedNodes,
    movedNodeIds,
    nodesById,
    suppressSameParentReorder,
  );
  const isMultiRowReorder = context.isSameParentReorder && context.isWrapEnabled && context.orderedMovedIds.length > 1;
  const isFloatingReorder = suppressSameParentReorder && desiredParentId === currentParentId;

  switch (true) {
    case isFloatingReorder:
      armAutoLayoutFloatingReorderPreview(canvasRefs, desiredParent, desiredParentId, selectedNodes, point, context);
      break;
    case isMultiRowReorder:
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
      break;
    default:
      armAutoLayoutSingleLineDropTarget(canvasRefs, desiredParent, desiredParentId, selectedNodes, grabbedNodeId, point, context);
  }
};
