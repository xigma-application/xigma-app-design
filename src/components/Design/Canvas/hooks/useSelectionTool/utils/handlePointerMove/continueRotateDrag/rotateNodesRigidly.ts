// store
import { updateNode } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TBoxSceneNode, TSceneNode } from 'types/design/types';
import { TPoint } from 'types/canvas';
import { TRotateNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { getRigidTransformNodes } from 'store/design/utils/nodeHierarchy/getRigidTransformNodes';
import { getRotateNodeOrigins } from '../../handlePointerDown/getRotateNodeOrigins';
import { getRotatedNodeChanges } from './getRotatedNodeChanges';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { pinRotatedGroupBounds } from './pinRotatedGroupBounds';
import { rotateFillsCrop } from 'components/Design/Canvas/utils/rotateFillsCrop';

const dispatchRigidlyRotatedNodeChanges = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  pivot: TPoint,
  deltaDegrees: number,
  isSingleNodeRotate: boolean,
  id: string,
  origin: TRotateNodeOrigin,
): void => {
  const currentNode = nodes[id];
  const geometryChanges = getRotatedNodeChanges(origin, pivot, deltaDegrees, isSingleNodeRotate);
  const fills = currentNode && isAppearanceNode(currentNode) ? rotateFillsCrop(currentNode.fills, pivot, deltaDegrees) : undefined;

  dispatch(updateNode({ changes: fills ? { ...geometryChanges, fills } : geometryChanges, id }));
};

const dispatchRigidRotationChanges = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  nodeOrigins: Record<string, TRotateNodeOrigin>,
  pivot: TPoint,
  deltaDegrees: number,
  isSingleNodeRotate: boolean,
): void => {
  Object.entries(nodeOrigins).forEach(([id, origin]) =>
    dispatchRigidlyRotatedNodeChanges(dispatch, nodes, pivot, deltaDegrees, isSingleNodeRotate, id, origin),
  );
};

export const rotateNodesRigidly = (dispatch: AppDispatch, node: TBoxSceneNode, nextRotation: number): void => {
  const deltaDegrees = nextRotation - node.rotation;

  if (deltaDegrees !== 0) {
    const nodes = selectNodes(store.getState());
    const pivot = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    const targetNodes = getRigidTransformNodes([node], nodes);
    const nodeOrigins = getRotateNodeOrigins(targetNodes);
    const isSingleNodeRotate = targetNodes.length === 1;

    dispatchRigidRotationChanges(dispatch, nodes, nodeOrigins, pivot, deltaDegrees, isSingleNodeRotate);
    pinRotatedGroupBounds(dispatch, nodeOrigins);
  }
};
