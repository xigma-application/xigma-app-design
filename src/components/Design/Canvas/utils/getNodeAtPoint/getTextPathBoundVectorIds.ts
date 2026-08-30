// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const getTextPathBoundVectorIds = (nodes: TSceneNode[]): Set<string> => {
  const boundVectorIds = new Set<string>();

  nodes.forEach((node) => {
    if (node.type === NodeType.text && node.pathId) {
      boundVectorIds.add(node.pathId);
    }
  });

  return boundVectorIds;
};
