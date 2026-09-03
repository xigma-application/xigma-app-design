// store
import { getIsDescendantOfMovedNodes } from 'store/design/utils/handleMoveNodes/getIsDescendantOfMovedNodes';
import { isClickThroughFrame } from 'store/design/utils/nodeHierarchy/isClickThroughFrame';

// types
import { TSceneNode } from 'types/design/types';

export const pruneMarqueeDescendants = (collided: TSceneNode[], nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  const collidedFrameIds = collided.filter((node) => isClickThroughFrame(node, nodesById)).map((node) => node.id);

  return collided.filter((node) => !getIsDescendantOfMovedNodes(node.parentId, collidedFrameIds, nodesById));
};
