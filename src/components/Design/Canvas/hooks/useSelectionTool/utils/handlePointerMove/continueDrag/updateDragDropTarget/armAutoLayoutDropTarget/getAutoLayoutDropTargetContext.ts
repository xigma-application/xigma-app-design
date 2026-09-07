// store
import { getAutoLayoutNodeLocalBounds } from 'store/design/utils/autoLayout/getAutoLayoutNodeLocalBounds';
import { getFramePadding } from 'store/design/utils/autoLayout/getFramePadding';

// types
import { AlignmentLayout, LayoutMode, SizingMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions';
import { TAutoLayoutDropTargetContext } from './types';
import { TAutoLayoutFrame } from '../types';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutOrderedDraggedSizes } from './getAutoLayoutOrderedDraggedSizes';
import { getAutoLayoutOriginalIndex } from './getAutoLayoutOriginalIndex';
import { getAutoLayoutSiblingEntries } from './getAutoLayoutSiblingEntries';

const getSiblingSizes = (
  siblingEntries: { bounds: TDraftRect; sibling: TSceneNode }[],
  localSiblingBounds: TDraftRect[],
): TAutoLayoutChildSize[] =>
  localSiblingBounds.map((bounds, index) => ({
    height: bounds.height,
    id: siblingEntries[index].sibling.id,
    width: bounds.width,
  }));

const getSiblingRealPositions = (
  siblingEntries: { bounds: TDraftRect; sibling: TSceneNode }[],
  localSiblingBounds: TDraftRect[],
): TAutoLayoutChildPosition[] =>
  localSiblingBounds.map((bounds, index) => ({
    height: bounds.height,
    id: siblingEntries[index].sibling.id,
    width: bounds.width,
    x: bounds.x,
    y: bounds.y,
  }));

export const getAutoLayoutDropTargetContext = (
  desiredParent: TAutoLayoutFrame,
  desiredParentId: string,
  currentParentId: string | null,
  selectedNodes: TSceneNode[],
  movedNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
  suppressSameParentReorder: boolean,
): TAutoLayoutDropTargetContext => {
  const siblingEntries = getAutoLayoutSiblingEntries(desiredParent, movedNodeIds, nodesById);
  const localSiblingBounds = siblingEntries.map(({ sibling }) => getAutoLayoutNodeLocalBounds(sibling, desiredParent));
  const siblingSizes = getSiblingSizes(siblingEntries, localSiblingBounds);
  const realPositions = getSiblingRealPositions(siblingEntries, localSiblingBounds);
  const isSameParentReorder = desiredParentId === currentParentId && !suppressSameParentReorder;
  const originalIndex = isSameParentReorder ? getAutoLayoutOriginalIndex(desiredParent.childIds, movedNodeIds) : null;
  const orderedMovedIds = isSameParentReorder ? desiredParent.childIds.filter((id) => movedNodeIds.includes(id)) : movedNodeIds;
  const draggedSizes = getAutoLayoutOrderedDraggedSizes(orderedMovedIds, selectedNodes, desiredParent.rotation);
  const isHorizontal = desiredParent.layoutMode === LayoutMode.horizontal;
  const itemSpacing = (isHorizontal ? desiredParent.horizontalGap : desiredParent.verticalGap) ?? 0;
  const counterAxisSpacing = (isHorizontal ? desiredParent.verticalGap : desiredParent.horizontalGap) ?? itemSpacing;
  const alignment = desiredParent.layoutAlignment ?? AlignmentLayout.topLeft;
  const padding = getFramePadding(desiredParent);
  const primaryMode = isHorizontal ? desiredParent.widthSizingMode : desiredParent.heightSizingMode;
  const isWrapEnabled = Boolean(desiredParent.layoutWrap) && primaryMode !== SizingMode.hug;

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
