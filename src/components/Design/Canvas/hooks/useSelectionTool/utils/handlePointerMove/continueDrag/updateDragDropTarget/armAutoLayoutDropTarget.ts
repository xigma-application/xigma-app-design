// store
import {
  getAutoLayoutDropTarget,
  TAutoLayoutDropTarget,
} from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutDropTarget';
import { getAutoLayoutWrappedDropTarget } from 'store/design/utils/autoLayout/getAutoLayoutWrappedDropTarget/getAutoLayoutWrappedDropTarget';
import { getFramePadding } from 'store/design/utils/autoLayout/getFramePadding';
import { getNodesBoundingBox } from 'store/design/utils/getNodesBoundingBox';

// types
import { AlignmentLayout, LayoutMode, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions';
import { TAutoLayoutFrame } from './types';
import { TAutoLayoutPadding } from 'store/design/utils/autoLayout/getAutoLayoutContentBox';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutDropIndicator } from './armAutoLayoutDropIndicator';
import { armAutoLayoutReorderPreview } from './armAutoLayoutReorderPreview';
import { getAutoLayoutOrderedDraggedSizes } from './getAutoLayoutOrderedDraggedSizes';
import { getAutoLayoutOriginalIndex } from './getAutoLayoutOriginalIndex';
import { getAutoLayoutSiblingEntries } from './getAutoLayoutSiblingEntries';

const getAutoLayoutFrameDropTarget = (
  desiredParent: TAutoLayoutFrame,
  itemSpacing: number,
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  padding: TAutoLayoutPadding,
  siblingSizes: TAutoLayoutChildSize[],
  realPositions: TAutoLayoutChildPosition[],
  originalIndex: number | null,
  draggedSize: { height: number; width: number },
  draggedSizes: TAutoLayoutChildSize[],
  point: TPoint,
): TAutoLayoutDropTarget => {
  const isWrapEnabled = Boolean(desiredParent.layoutWrap) && desiredParent.primaryAxisSizingMode !== SizingMode.hug;

  return isWrapEnabled
    ? getAutoLayoutWrappedDropTarget(
        desiredParent.layoutMode,
        itemSpacing,
        counterAxisSpacing,
        alignment,
        desiredParent,
        padding,
        siblingSizes,
        originalIndex,
        draggedSize,
        draggedSizes,
        point,
      )
    : getAutoLayoutDropTarget(
        desiredParent.layoutMode,
        itemSpacing,
        alignment,
        desiredParent,
        padding,
        siblingSizes,
        realPositions,
        originalIndex,
        draggedSize,
        point,
      );
};

export const armAutoLayoutDropTarget = (
  canvasRefs: TCanvasRefs,
  desiredParent: TAutoLayoutFrame,
  desiredParentId: string,
  currentParentId: string | null,
  selectedNodes: TSceneNode[],
  movedNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
  point: TPoint,
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
};
