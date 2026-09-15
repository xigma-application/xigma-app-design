// types
import { TSceneNode } from 'types/design/types';

const hasChildIds = (node: TSceneNode): node is TSceneNode & { childIds: string[] } => 'childIds' in node;

export const collectPatternSourceSubtree = (nodeId: string, nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  const node = nodesById[nodeId];

  if (node) {
    const subtree = [node];

    if (hasChildIds(node)) {
      node.childIds.forEach((childId) => {
        subtree.push(...collectPatternSourceSubtree(childId, nodesById));
      });
    }

    return subtree;
  }

  return [];
};
