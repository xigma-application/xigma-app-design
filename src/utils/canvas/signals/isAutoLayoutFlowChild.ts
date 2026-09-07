// types
import { TSceneNode } from 'types/design/types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export const isAutoLayoutFlowChild = (id: string, nodesById: Record<string, TSceneNode>): boolean => {
  const node = nodesById[id];
  return !(node && isBoxSceneNode(node) && node.ignoreAutoLayout);
};
