// types
import { TSceneNode } from 'types/design/types';

// utils
import { isLayoutContainerNode } from 'utils/canvas/signals/isLayoutContainerNode';

export const getMaskChildOrder = (childIds: string[], nodes: Record<string, TSceneNode>): string[] => {
  const lastNode = nodes[childIds[childIds.length - 1]];

  if (lastNode && isLayoutContainerNode(lastNode)) {
    const reverseIndex = [...childIds].reverse().findIndex((id) => {
      const node = nodes[id];

      return node && !isLayoutContainerNode(node);
    });

    if (reverseIndex !== -1) {
      const validIndex = childIds.length - 1 - reverseIndex;
      const reordered = childIds.filter((_, index) => index !== validIndex);

      reordered.push(childIds[validIndex]);

      return reordered;
    }
  }

  return childIds;
};
