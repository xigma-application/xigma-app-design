// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutChildPosition } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDesignState } from '../../../types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutRotatedSlotPosition } from '../getAutoLayoutRotatedSlotPosition';
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { getGroupSubtreeNodes } from '../../nodeHierarchy/getGroupSubtreeNodes';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { syncAutoLayoutChildren } from './syncAutoLayoutChildren';

const applySyncedChildSize = (
  frame: TFrameNode,
  child: TSceneNode,
  bound: TDraftRect,
  target: TAutoLayoutChildPosition,
): { appliedHeight: number; appliedWidth: number } => {
  if (isBoxSceneNode(child) && child.rotation === frame.rotation && (target.width !== bound.width || target.height !== bound.height)) {
    child.width = target.width;
    child.height = target.height;

    return { appliedHeight: target.height, appliedWidth: target.width };
  }

  return { appliedHeight: bound.height, appliedWidth: bound.width };
};

const syncNestedAutoLayoutFrame = (state: TDesignState, child: TSceneNode): void => {
  if (
    child.type === NodeType.frame &&
    (child.layoutMode === LayoutMode.horizontal || child.layoutMode === LayoutMode.vertical || child.layoutMode === LayoutMode.grid)
  ) {
    syncAutoLayoutChildren(state, child.id);
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
  const targetPosition = getAutoLayoutRotatedSlotPosition(
    target,
    { height: appliedHeight, width: appliedWidth },
    frameCenter,
    frame.rotation,
  );
  const deltaX = targetPosition.x - bound.x;
  const deltaY = targetPosition.y - bound.y;

  getGroupSubtreeNodes(child, nodes).forEach((subtreeNode) => {
    Object.assign(subtreeNode, getGeometryDeltaChanges(subtreeNode, deltaX, deltaY));
  });
  syncNestedAutoLayoutFrame(state, child);
};
