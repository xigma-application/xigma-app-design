// types
import { TSceneNode } from 'types/design/types';

export const pruneExpandedIds = (expandedIds: Set<string>, nodes: Record<string, TSceneNode>): Set<string> => {
  const pruned = new Set([...expandedIds].filter((id) => Boolean(nodes[id])));
  return pruned.size === expandedIds.size ? expandedIds : pruned;
};
