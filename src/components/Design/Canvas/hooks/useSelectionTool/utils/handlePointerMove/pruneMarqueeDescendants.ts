// store
import { getIsDescendantOfMovedNodes } from 'store/design/utils/handleMoveNodes/getIsDescendantOfMovedNodes';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const pruneMarqueeDescendants = (collided: TSceneNode[], nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  const collidedFrameIds = collided.filter((node) => node.type === NodeType.frame && node.childIds.length > 0).map((node) => node.id);

  return collided.filter((node) => !getIsDescendantOfMovedNodes(node.parentId, collidedFrameIds, nodesById));
};
