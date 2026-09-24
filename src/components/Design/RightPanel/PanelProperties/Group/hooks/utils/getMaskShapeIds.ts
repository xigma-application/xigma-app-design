// types
import { TSceneNode } from 'types/design/types';

// utils
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';

export const getMaskShapeIds = (maskIds: string[], nodes: Record<string, TSceneNode>): string[] =>
  maskIds.flatMap((id) => {
    const mask = nodes[id];
    return mask && isContainerNode(mask) ? mask.childIds.slice(-1) : [];
  });
