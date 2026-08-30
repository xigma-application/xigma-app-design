// types
import { TSceneNode } from 'types/design/types';

export const remapClonedRootId = (
  clonedNodes: TSceneNode[],
  freshRootId: string,
  targetId: string,
  targetParentId: string | null,
): TSceneNode[] =>
  clonedNodes.map((node) => {
    switch (true) {
      case node.id === freshRootId:
        return { ...node, id: targetId, parentId: targetParentId };
      case node.parentId === freshRootId:
        return { ...node, parentId: targetId };
      default:
        return node;
    }
  });
