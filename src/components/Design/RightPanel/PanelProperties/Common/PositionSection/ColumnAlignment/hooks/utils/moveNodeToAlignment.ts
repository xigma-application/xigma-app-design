// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TBoxSceneNode, TNodeAlignment } from 'types/design/types';

// utils
import { commitAlignmentConstraint } from './commitAlignmentConstraint';
import { getAlignedChildLocalPosition } from 'store/design/utils/getAlignedChildLocalPosition';
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';
import { getNodePositionInParent } from 'store/design/utils/getNodePositionInParent';

type TParent = Parameters<typeof getNodeAbsoluteFromParentPosition>[1];

export const moveNodeToAlignment = (
  dispatch: AppDispatch,
  node: TBoxSceneNode | undefined,
  parent: TParent | undefined,
  next: TNodeAlignment,
): void => {
  if (node && parent) {
    const currentLocal = getNodePositionInParent(node, parent);
    const targetLocal = getAlignedChildLocalPosition(next, parent, node, currentLocal);
    const targetAbsolute = getNodeAbsoluteFromParentPosition(targetLocal, parent);

    dispatch(
      updateNode({
        changes: { alignment: next, x: Math.round(targetAbsolute.x), y: Math.round(targetAbsolute.y) },
        id: node.id,
      }),
    );
  } else {
    commitAlignmentConstraint(dispatch, node, next);
  }
};
