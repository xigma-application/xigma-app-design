// store
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';

// types
import { TSceneNode } from 'types/design/types';

export const expandSelectedContainers = (selectedNodes: TSceneNode[]): string[] =>
  selectedNodes.flatMap((node) => (isContainerNode(node) ? node.childIds : [node.id]));
