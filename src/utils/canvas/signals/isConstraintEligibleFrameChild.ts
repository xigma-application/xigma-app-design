// types
import { TSceneNode } from 'types/design/types';

// utils
import { isAutoLayoutFrame } from './isAutoLayoutFrame';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { isFreeformFrame } from './isFreeformFrame';

export const isConstraintEligibleFrameChild = (node: TSceneNode, nodesById: Record<string, TSceneNode>): boolean => {
  const parent = node.parentId ? nodesById[node.parentId] : undefined;

  if (parent && isBoxSceneNode(node)) {
    if (isFreeformFrame(parent)) {
      return true;
    }

    return isAutoLayoutFrame(parent) && Boolean(node.ignoreAutoLayout);
  }

  return false;
};
