// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const dropTextPathGuides = (selectedIds: string[], nodes: Record<string, TSceneNode>): string[] => {
  const boundVectorIds = new Set<string>();

  Object.values(nodes).forEach((node) => {
    if (node.type === NodeType.text && node.pathId) {
      boundVectorIds.add(node.pathId);
    }
  });

  return selectedIds.filter((id) => {
    const node = nodes[id];

    return !node || (node.type !== NodeType.path && !boundVectorIds.has(id));
  });
};
