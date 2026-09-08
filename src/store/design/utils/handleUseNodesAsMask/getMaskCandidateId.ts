// types
import { TSceneNode } from 'types/design/types';

// utils
import { isLayoutContainerNode } from 'utils/canvas/signals/isLayoutContainerNode';

export const getMaskCandidateId = (childIds: string[], nodes: Record<string, TSceneNode>): string => {
  const nonContainerId = [...childIds].reverse().find((childId) => !isLayoutContainerNode(nodes[childId]));

  return nonContainerId ?? childIds[childIds.length - 1];
};
