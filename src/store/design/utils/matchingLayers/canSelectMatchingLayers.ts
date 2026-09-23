// types
import { TSceneNode } from 'types/design/types';

// utils
import { getMatchingScope } from './getMatchingScope';

export const canSelectMatchingLayers = (selectedIds: string[], nodesById: Record<string, TSceneNode>): boolean =>
  selectedIds.length > 0 &&
  selectedIds.every((nodeId) => {
    const node = nodesById[nodeId];
    return Boolean(node && getMatchingScope(node, nodesById));
  });
