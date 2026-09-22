// types
import { TSceneNode } from 'types/design/types';

const hasChildIds = (node: TSceneNode): node is TSceneNode & { childIds: string[] } => 'childIds' in node;

export const getExportSubtreeNodes = (nodeId: string, nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  const node = nodesById[nodeId];

  if (node && !node.hidden) {
    const children = hasChildIds(node) ? node.childIds.flatMap((childId) => getExportSubtreeNodes(childId, nodesById)) : [];
    return [node, ...children];
  }

  return [];
};
