// types
import { TSceneNode } from 'types/design/types';

// utils
import { isFlowManagedNode } from './isFlowManagedNode';

export const getDeferredDragNodes = (
  selectedNodes: TSceneNode[],
  grabbedGroup: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
): TSceneNode[] => selectedNodes.filter((node) => !grabbedGroup.includes(node) && isFlowManagedNode(node, nodesById));
