// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const hasLayoutContainerChild = (childIds: string[], nodes: Record<string, TSceneNode>): boolean =>
  childIds.some((childId) => {
    const child = nodes[childId];
    return Boolean(child) && containsLayoutContainerNode(child, nodes);
  });

export const containsLayoutContainerNode = (node: TSceneNode, nodes: Record<string, TSceneNode>): boolean => {
  switch (node.type) {
    case NodeType.frame:
    case NodeType.section:
      return true;
    case NodeType.group:
    case NodeType.mask:
      return hasLayoutContainerChild(node.childIds, nodes);
    default:
      return false;
  }
};
