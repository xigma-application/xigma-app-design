// store
import { getAutoLayoutDropTarget } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget';
import { getFramePadding } from 'store/design/utils/autoLayout/getFramePadding';
import { getNodesBoundingBox } from 'store/design/utils/getNodesBoundingBox';

// types
import { AlignmentLayout } from 'types/design/enums';
import { TAutoLayoutFrame } from './types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutDropIndicator } from './armAutoLayoutDropIndicator';
import { armAutoLayoutReorderPreview } from './armAutoLayoutReorderPreview';
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
): void => {
  const siblingEntries = getAutoLayoutSiblingEntries(desiredParent, movedNodeIds, nodesById);
  const siblingSizes = siblingEntries.map(({ bounds, sibling }) => ({ height: bounds.height, id: sibling.id, width: bounds.width }));
  const realPositions = siblingEntries.map(({ bounds, sibling }) => ({ id: sibling.id, x: bounds.x, y: bounds.y }));
  const isSameParentReorder = desiredParentId === currentParentId;
  const originalIndex = isSameParentReorder ? getAutoLayoutOriginalIndex(desiredParent.childIds, movedNodeIds) : null;
  const dropTarget = getAutoLayoutDropTarget(
    desiredParent.layoutMode,
    desiredParent.itemSpacing ?? 0,
    desiredParent.layoutAlignment ?? AlignmentLayout.topLeft,
    desiredParent,
    getFramePadding(desiredParent),
    siblingSizes,
    realPositions,
    originalIndex,
    getNodesBoundingBox(selectedNodes),
    point,
  );

  if (isSameParentReorder) {
    armAutoLayoutReorderPreview(canvasRefs, desiredParentId, dropTarget, siblingEntries);
  } else {
    armAutoLayoutDropIndicator(canvasRefs, desiredParentId, dropTarget);
  }
};
