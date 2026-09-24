// types
import { TSceneNode } from 'types/design/types';

// utils
import { isFlowManagedNode } from './isFlowManagedNode';

export const getDeferredDragNodes = (
  selectedNodes: TSceneNode[],
  grabbedGroup: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
): TSceneNode[] => {
  const grabbedSet = new Set(grabbedGroup);
  return selectedNodes.filter((node) => !grabbedSet.has(node) && isFlowManagedNode(node, nodesById));
};
