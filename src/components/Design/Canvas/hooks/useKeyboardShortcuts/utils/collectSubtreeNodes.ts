// store
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const visitSubtreeNode = (nodes: Record<string, TSceneNode>, id: string, visited: Set<string>, result: TSceneNode[]): void => {
  const node = nodes[id];
  const isUnvisited = Boolean(node) && !visited.has(id);

  if (isUnvisited) {
    visited.add(id);
    result.push(node);

    if (isContainerNode(node)) {
      node.childIds.forEach((childId) => visitSubtreeNode(nodes, childId, visited, result));
    } else if (node.type === NodeType.text && node.pathId) {
      visitSubtreeNode(nodes, node.pathId, visited, result);
    }
  }
};

export const collectSubtreeNodes = (nodes: Record<string, TSceneNode>, rootIds: string[]): TSceneNode[] => {
  const visited = new Set<string>();
  const result: TSceneNode[] = [];

  rootIds.forEach((id) => visitSubtreeNode(nodes, id, visited, result));

  return result;
};
