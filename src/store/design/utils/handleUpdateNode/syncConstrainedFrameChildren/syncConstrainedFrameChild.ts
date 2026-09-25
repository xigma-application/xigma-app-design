// types
import { TFrameBoxSnapshot } from './syncConstrainedFrameChildren';
import { TFrameNode, TNodeAlignment, TSceneNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getAxisConstraintDelta } from '../../getAxisConstraintDelta';
import { getNodeAbsoluteFromParentPosition } from '../../getNodeAbsoluteFromParentPosition';
import { getNodePositionInParent } from '../../getNodePositionInParent';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { isConstraintEligibleFrameChild } from 'utils/canvas/signals/isConstraintEligibleFrameChild';
import { moveConstrainedChildSubtree } from './moveConstrainedChildSubtree';

const getConstrainedTargetLocal = (
  oldLocal: TPoint,
  child: { alignment?: TNodeAlignment },
  widthDelta: number,
  heightDelta: number,
): TPoint => ({
  x: oldLocal.x + getAxisConstraintDelta(child.alignment?.horizontal, widthDelta),
  y: oldLocal.y + getAxisConstraintDelta(child.alignment?.vertical, heightDelta),
});

export const syncConstrainedFrameChild = (
  nodes: Record<string, TSceneNode>,
  frame: TFrameNode,
  previousBox: TFrameBoxSnapshot,
  widthDelta: number,
  heightDelta: number,
  childId: string,
): void => {
  const child = nodes[childId];

  if (child && isBoxSceneNode(child) && isConstraintEligibleFrameChild(child, nodes)) {
    const oldLocal = getNodePositionInParent(child, previousBox);
    const targetLocal = getConstrainedTargetLocal(oldLocal, child, widthDelta, heightDelta);
    const targetAbsolute = getNodeAbsoluteFromParentPosition(targetLocal, frame);
    const deltaX = Math.round(targetAbsolute.x - child.x);
    const deltaY = Math.round(targetAbsolute.y - child.y);

    if (deltaX !== 0 || deltaY !== 0) {
      moveConstrainedChildSubtree(nodes, child, deltaX, deltaY);
    }
  }
};
