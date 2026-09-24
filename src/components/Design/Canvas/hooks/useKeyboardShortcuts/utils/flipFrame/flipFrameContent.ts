// store
import { AppDispatch, store } from 'store';
import { selectNodes } from 'store/design/selectors';
import { moveNodes, updateNode } from 'store/design/slice';

// types
import { LayoutMode } from 'types/design/enums';
import { TFlipAxis } from './types';
import { TPoint } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { flipLeafNode } from './flipLeafNode';
import { getFlippedGridChildChanges } from './getFlippedGridChildChanges';
import { getMirroredConstraint } from './getMirroredConstraint';
import { getReversedWrapLineOrder } from './getReversedWrapLineOrder';
import { getGroupLeafNodes } from 'store/design/utils/nodeHierarchy/getGroupLeafNodes';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { isConstraintEligibleFrameChild } from 'utils/canvas/signals/isConstraintEligibleFrameChild';
import { isLayoutContainerNode } from 'utils/canvas/signals/isLayoutContainerNode';
import { isNudgeableNode } from '../isNudgeableNode';

type TFlipFrameTree = (dispatch: AppDispatch, frameId: string, axis: TFlipAxis, mirrorCenter: TPoint | null) => void;

const getCenter = (node: TSceneNode): TPoint => {
  const bounds = getRotatedNodeBounds(node);

  return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
};

const flipGridPlacement = (dispatch: AppDispatch, frame: TFrameNode, nodes: Record<string, TSceneNode>, axis: TFlipAxis): void => {
  if (frame.layoutMode === LayoutMode.grid) {
    getFlippedGridChildChanges(frame, nodes, axis).forEach(({ changes, id }) => dispatch(updateNode({ changes, id })));
    dispatch(updateNode({ changes: { gridAutoPlacement: false }, id: frame.id }));
  }
};

const reverseWrapLines = (dispatch: AppDispatch, frame: TFrameNode, nodes: Record<string, TSceneNode>, axis: TFlipAxis): void => {
  const order = getReversedWrapLineOrder(frame, nodes, axis);

  if (order) {
    dispatch(moveNodes({ nodeIds: order, targetIndex: 0, targetParentId: frame.id }));
  }
};

const mirrorConstraint = (dispatch: AppDispatch, child: TSceneNode, axis: TFlipAxis): void => {
  if (isBoxSceneNode(child)) {
    if (isConstraintEligibleFrameChild(child, selectNodes(store.getState()))) {
      dispatch(updateNode({ changes: { alignment: getMirroredConstraint(child.alignment, axis) }, id: child.id }));
    }
  }
};

const flipChild = (dispatch: AppDispatch, child: TSceneNode, axis: TFlipAxis, frameCenter: TPoint, flipFrameTree: TFlipFrameTree): void => {
  const nodes = selectNodes(store.getState());

  mirrorConstraint(dispatch, child, axis);
  const anchor = isNudgeableNode(child, nodes) ? frameCenter : getCenter(child);
  const mirrorCenter = isNudgeableNode(child, nodes) ? frameCenter : null;

  getGroupLeafNodes(child, nodes).forEach((leaf) => {
    const freshLeaf = selectNodes(store.getState())[leaf.id];

    if (isLayoutContainerNode(freshLeaf)) {
      flipFrameTree(dispatch, freshLeaf.id, axis, mirrorCenter);
    } else {
      flipLeafNode(dispatch, freshLeaf, anchor, axis === 'horizontal' ? -1 : 1, axis === 'vertical' ? -1 : 1, false);
    }
  });
};

export const flipFrameContent = (dispatch: AppDispatch, frameId: string, axis: TFlipAxis, flipFrameTree: TFlipFrameTree): void => {
  const nodes = selectNodes(store.getState());
  const frame = nodes[frameId] as TFrameNode;
  const frameCenter = getCenter(frame);

  flipGridPlacement(dispatch, frame, nodes, axis);
  reverseWrapLines(dispatch, frame, nodes, axis);
  frame.childIds.forEach((childId) => {
    const child = selectNodes(store.getState())[childId];

    if (child) {
      flipChild(dispatch, child, axis, frameCenter, flipFrameTree);
    }
  });
};
