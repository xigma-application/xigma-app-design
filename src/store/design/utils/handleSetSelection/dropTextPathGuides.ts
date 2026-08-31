// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const dropTextPathGuides = (selectedIds: string[], nodes: Record<string, TSceneNode>): string[] => {
  const boundGuideIds = new Set<string>();

  Object.values(nodes).forEach((node) => {
    if (node.type === NodeType.text && node.pathId) {
      boundGuideIds.add(node.pathId);
    }
  });

  return selectedIds.filter((id) => !boundGuideIds.has(id));
};
