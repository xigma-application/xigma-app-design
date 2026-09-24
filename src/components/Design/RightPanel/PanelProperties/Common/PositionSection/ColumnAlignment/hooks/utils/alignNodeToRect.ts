// store
import { AppDispatch } from 'store';

// types
import { TDraftRect } from 'types/canvas';
import { TNodeAlignment, TSceneNode } from 'types/design/types';

// utils
import { getAlignmentOffset } from './getAlignmentOffset';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { translateNodeSubtree } from './translateNodeSubtree';

export const alignNodeToRect = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  node: TSceneNode,
  target: TDraftRect,
  next: TNodeAlignment,
): void => {
  const bounds = getRotatedNodeBounds(node);
  const deltaX = getAlignmentOffset(next.horizontal, bounds.x, bounds.width, target.x, target.width);
  const deltaY = getAlignmentOffset(next.vertical, bounds.y, bounds.height, target.y, target.height);

  translateNodeSubtree(dispatch, nodes, node, deltaX, deltaY);
};
