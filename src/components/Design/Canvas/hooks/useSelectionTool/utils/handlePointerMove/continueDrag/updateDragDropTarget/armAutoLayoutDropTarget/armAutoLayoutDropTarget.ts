// store
import { getFramePadding } from 'store/design/utils/autoLayout/getFramePadding';
import { getNodesBoundingBox } from 'store/design/utils/getNodesBoundingBox';

// types
import { AlignmentLayout, LayoutMode, SizingMode } from 'types/design/enums';
import { TAutoLayoutFrame } from '../types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutDropIndicator } from './armAutoLayoutDropIndicator';
import { armAutoLayoutMultiRowReorderPreview } from './armAutoLayoutMultiRowReorderPreview';
import { armAutoLayoutReorderPreview } from './armAutoLayoutReorderPreview';
import { getAutoLayoutFrameDropTarget } from './getAutoLayoutFrameDropTarget';
import { getAutoLayoutOrderedDraggedSizes } from './getAutoLayoutOrderedDraggedSizes';
import { getAutoLayoutOriginalIndex } from './getAutoLayoutOriginalIndex';
import { getAutoLayoutSiblingEntries } from './getAutoLayoutSiblingEntries';

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
  const siblingEntries = getAutoLayoutSiblingEntries(desiredParent, movedNodeIds, nodesById);
  const siblingSizes = siblingEntries.map(({ bounds, sibling }) => ({ height: bounds.height, id: sibling.id, width: bounds.width }));
  const realPositions = siblingEntries.map(({ bounds, sibling }) => ({ id: sibling.id, x: bounds.x, y: bounds.y }));
  const isSameParentReorder = desiredParentId === currentParentId;
  const originalIndex = isSameParentReorder ? getAutoLayoutOriginalIndex(desiredParent.childIds, movedNodeIds) : null;
  const orderedMovedIds = isSameParentReorder ? desiredParent.childIds.filter((id) => movedNodeIds.includes(id)) : movedNodeIds;
  const draggedSizes = getAutoLayoutOrderedDraggedSizes(orderedMovedIds, selectedNodes);
  const isHorizontal = desiredParent.layoutMode === LayoutMode.horizontal;
  const itemSpacing = (isHorizontal ? desiredParent.horizontalGap : desiredParent.verticalGap) ?? 0;
  const counterAxisSpacing = (isHorizontal ? desiredParent.verticalGap : desiredParent.horizontalGap) ?? itemSpacing;
  const alignment = desiredParent.layoutAlignment ?? AlignmentLayout.topLeft;
  const padding = getFramePadding(desiredParent);
  const isWrapEnabled = Boolean(desiredParent.layoutWrap) && desiredParent.primaryAxisSizingMode !== SizingMode.hug;

  if (isSameParentReorder && isWrapEnabled && orderedMovedIds.length > 1) {
    armAutoLayoutMultiRowReorderPreview(
      canvasRefs,
      desiredParent,
      desiredParentId,
      nodesById,
      siblingEntries,
      siblingSizes,
      itemSpacing,
      counterAxisSpacing,
      alignment,
      padding,
      draggedSizes,
      orderedMovedIds,
      grabbedNodeId,
      point,
    );
  } else {
    const draggedSize = getNodesBoundingBox(selectedNodes);
    const dropTarget = getAutoLayoutFrameDropTarget(
      desiredParent,
      itemSpacing,
      counterAxisSpacing,
      alignment,
      padding,
      siblingSizes,
      realPositions,
      originalIndex,
      draggedSize,
      draggedSizes,
      point,
    );

    if (isSameParentReorder) {
      armAutoLayoutReorderPreview(canvasRefs, desiredParentId, dropTarget, siblingEntries);
    } else {
      armAutoLayoutDropIndicator(canvasRefs, desiredParentId, dropTarget);
    }
  }
};
