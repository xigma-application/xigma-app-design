// store
import { getFramePadding } from 'store/design/utils/autoLayout/getFramePadding';

// types
import { AlignmentLayout, LayoutMode, SizingMode } from 'types/design/enums';
import { TAutoLayoutDropTargetContext } from './types';
import { TAutoLayoutFrame } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutOrderedDraggedSizes } from './getAutoLayoutOrderedDraggedSizes';
import { getAutoLayoutOriginalIndex } from './getAutoLayoutOriginalIndex';
import { getAutoLayoutSiblingEntries } from './getAutoLayoutSiblingEntries';

export const getAutoLayoutDropTargetContext = (
  desiredParent: TAutoLayoutFrame,
  desiredParentId: string,
  currentParentId: string | null,
  selectedNodes: TSceneNode[],
  movedNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
): TAutoLayoutDropTargetContext => {
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

  return {
    alignment,
    counterAxisSpacing,
    draggedSizes,
    isSameParentReorder,
    isWrapEnabled,
    itemSpacing,
    orderedMovedIds,
    originalIndex,
    padding,
    realPositions,
    siblingEntries,
    siblingSizes,
  };
};
