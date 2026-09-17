// types
import { TAutoLayoutChildPosition } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDesignState } from '../../../../types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { applySyncedChildSize } from './applySyncedChildSize';
import { getAutoLayoutRotatedSlotPosition } from '../../getAutoLayoutRotatedSlotPosition';
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { getGroupSubtreeNodes } from '../../../nodeHierarchy/getGroupSubtreeNodes';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { syncNestedAutoLayoutFrame } from './syncNestedAutoLayoutFrame';
import { translateFillsCrop } from 'components/Design/Canvas/utils/translateFillsCrop';

const applyDeltaToSubtreeNode = (subtreeNode: TSceneNode, deltaX: number, deltaY: number): void => {
  Object.assign(subtreeNode, getGeometryDeltaChanges(subtreeNode, deltaX, deltaY));

  if (isAppearanceNode(subtreeNode)) {
    const fills = translateFillsCrop(subtreeNode.fills, deltaX, deltaY);

    if (fills) {
      subtreeNode.fills = fills;
    }
  }
};

export const applyAutoLayoutSyncChildPosition = (
  state: TDesignState,
  nodes: Record<string, TSceneNode>,
  frame: TFrameNode,
  frameCenter: TPoint,
  child: TSceneNode,
  bound: TDraftRect,
  target: TAutoLayoutChildPosition,
): void => {
  const { appliedHeight, appliedWidth } = applySyncedChildSize(frame, child, bound, target);
  const slotSize = { height: appliedHeight, width: appliedWidth };
  const targetPosition = getAutoLayoutRotatedSlotPosition(target, slotSize, frameCenter, frame.rotation);
  const deltaX = targetPosition.x - bound.x;
  const deltaY = targetPosition.y - bound.y;

  getGroupSubtreeNodes(child, nodes).forEach((subtreeNode) => applyDeltaToSubtreeNode(subtreeNode, deltaX, deltaY));
  syncNestedAutoLayoutFrame(state, child);
};
