// store
import { getAutoLayoutContentBox, TAutoLayoutPadding } from 'store/design/utils/autoLayout/getAutoLayoutContentBox';
import { getAutoLayoutReadingOrderSlot } from 'store/design/utils/autoLayout/getAutoLayoutReadingOrderSlot/getAutoLayoutReadingOrderSlot';
import { getAutoLayoutWrappedSiblingPositions } from 'store/design/utils/autoLayout/getAutoLayoutWrappedDropTarget/getAutoLayoutWrappedSiblingPositions';
import { getRotatedNodeBounds } from 'store/design/utils/getRotatedNodeBounds';

// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions';
import { TAutoLayoutFrame } from '../types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutReorderPreview } from './armAutoLayoutReorderPreview';
import { clamp } from 'utils/math/clamp';

const getAutoLayoutChildBounds = (childIds: string[], nodesById: Record<string, TSceneNode>): TDraftRect[] =>
  childIds
    .map((id) => nodesById[id])
    .filter(Boolean)
    .map((child) => getRotatedNodeBounds(child));

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
  const childBounds = getAutoLayoutChildBounds(desiredParent.childIds, nodesById);
  const grabbedIndexInBlock = Math.max(0, orderedMovedIds.indexOf(grabbedNodeId ?? ''));
  const readingOrderSlot = getAutoLayoutReadingOrderSlot(isHorizontal, childBounds, point);
  const index = clamp(readingOrderSlot - grabbedIndexInBlock, 0, siblingSizes.length);
  const siblingPositions = getAutoLayoutWrappedSiblingPositions(
    desiredParent.layoutMode,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    getAutoLayoutContentBox(desiredParent, padding),
    siblingSizes,
    index,
    draggedSizes,
  );

  armAutoLayoutReorderPreview(
    canvasRefs,
    desiredParentId,
    { index, indicator: { height: 0, width: 0, x: 0, y: 0 }, siblingPositions },
    siblingEntries,
  );
};
