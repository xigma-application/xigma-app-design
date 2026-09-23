// types
import { TSceneNode } from 'types/design/types';

// utils
import { isAutoLayoutFrame } from '../handlePointerMove/continueDrag/updateDragDropTarget/isAutoLayoutFrame';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { isGridFrame } from '../handlePointerMove/continueDrag/updateDragDropTarget/isGridFrame';

export const isFlowManagedNode = (node: TSceneNode, nodesById: Record<string, TSceneNode>): boolean => {
  const parent = node.parentId ? (nodesById[node.parentId] ?? null) : null;
  const isAbsoluteChild = isBoxSceneNode(node) && Boolean(node.ignoreAutoLayout);

  return (isAutoLayoutFrame(parent) || isGridFrame(parent)) && !isAbsoluteChild;
};
