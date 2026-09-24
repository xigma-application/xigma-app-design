// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const canBeTextPathGuide = (node: TSceneNode | undefined): boolean => node?.type === NodeType.path || node?.type === NodeType.vector;

export const dropTextPathGuides = (selectedIds: string[], nodes: Record<string, TSceneNode>): string[] => {
  if (selectedIds.some((id) => canBeTextPathGuide(nodes[id]))) {
    const boundGuideIds = new Set<string>();

    Object.values(nodes).forEach((node) => {
      if (node.type === NodeType.text && node.pathId) {
        boundGuideIds.add(node.pathId);
      }
    });

    return selectedIds.filter((id) => !boundGuideIds.has(id));
  }

  return selectedIds;
};
