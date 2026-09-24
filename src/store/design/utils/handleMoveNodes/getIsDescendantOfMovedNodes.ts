import { TSceneNode } from 'types/design/types';

import { getIsDescendantOfMovedIdSet } from './getIsDescendantOfMovedIdSet';

export const getIsDescendantOfMovedNodes = (
  targetParentId: string | null,
  movedNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
): boolean => getIsDescendantOfMovedIdSet(targetParentId, new Set(movedNodeIds), nodesById);
