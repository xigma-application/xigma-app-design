// types
import { TAutoLayoutChildPosition } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDesignState } from '../../../../types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { applySyncedChildSize } from './applySyncedChildSize';
import { getAutoLayoutRotatedSlotPosition } from '../../getAutoLayoutRotatedSlotPosition';
import { getCropPaintChanges } from 'components/Design/Canvas/utils/getCropPaintChanges';
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { getGroupSubtreeNodes } from '../../../nodeHierarchy/getGroupSubtreeNodes';
import { isImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/utils/isImageFrameNode';
import { syncNestedAutoLayoutFrame } from './syncNestedAutoLayoutFrame';
import { translateFillsCrop } from 'components/Design/Canvas/utils/translateFillsCrop';

const applyDeltaToSubtreeNode = (subtreeNode: TSceneNode, deltaX: number, deltaY: number): void => {
  Object.assign(subtreeNode, getGeometryDeltaChanges(subtreeNode, deltaX, deltaY));

  if (isImageFrameNode(subtreeNode)) {
    Object.assign(
      subtreeNode,
      getCropPaintChanges(subtreeNode, (paints) => translateFillsCrop(paints, deltaX, deltaY)),
    );
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
