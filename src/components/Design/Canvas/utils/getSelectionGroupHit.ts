// types
import { TSceneNode } from 'types/design/types';

// utils
import { getSelectionGroups } from './getSelectionGroups';

export const getSelectionGroupHit = <THit extends object>(
  selectedNodes: TSceneNode[],
  getHit: (group: TSceneNode[]) => THit | null,
): (THit & { group: TSceneNode[] }) | null => {
  for (const group of getSelectionGroups(selectedNodes)) {
    const hit = getHit(group);

    if (hit) {
      return { ...hit, group };
    }
  }

  return null;
};
