// types
import { TSceneNode } from 'types/design/types';

export const getSelectionGroups = (nodes: TSceneNode[]): TSceneNode[][] => {
  const groups = new Map<string | null, TSceneNode[]>();

  nodes.forEach((node) => {
    const key = node.parentId ?? null;
    groups.set(key, [...(groups.get(key) ?? []), node]);
  });

  return [...groups.values()];
};
