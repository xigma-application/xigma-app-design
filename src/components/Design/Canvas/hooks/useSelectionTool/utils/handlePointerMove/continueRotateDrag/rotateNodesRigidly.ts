// store
import { updateNode } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TFrameNode } from 'types/design/types';

// utils
import { getRigidTransformNodes } from 'store/design/utils/nodeHierarchy/getRigidTransformNodes';
import { getRotateNodeOrigins } from '../../handlePointerDown/getRotateNodeOrigins';
import { getRotatedNodeChanges } from './getRotatedNodeChanges';
import { pinRotatedGroupBounds } from './pinRotatedGroupBounds';

export const rotateNodesRigidly = (dispatch: AppDispatch, frame: TFrameNode, nextRotation: number): void => {
  const deltaDegrees = nextRotation - frame.rotation;

  if (deltaDegrees !== 0) {
    const nodes = selectNodes(store.getState());
    const pivot = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };
    const targetNodes = getRigidTransformNodes([frame], nodes);
    const nodeOrigins = getRotateNodeOrigins(targetNodes);
    const isSingleNodeRotate = targetNodes.length === 1;

    Object.entries(nodeOrigins).forEach(([id, origin]) => {
      dispatch(updateNode({ changes: getRotatedNodeChanges(origin, pivot, deltaDegrees, isSingleNodeRotate), id }));
    });
    pinRotatedGroupBounds(dispatch, nodeOrigins);
  }
};
