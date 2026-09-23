// types
import { TSceneNode } from 'types/design/types';

export const getGrabbedDragGroup = (selectedNodes: TSceneNode[], grabbedNodeId: string | null): TSceneNode[] => {
  const grabbedNode = selectedNodes.find((node) => node.id === grabbedNodeId);
  return grabbedNode ? selectedNodes.filter((node) => (node.parentId ?? null) === (grabbedNode.parentId ?? null)) : selectedNodes;
};
