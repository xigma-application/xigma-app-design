import { TSceneNode } from 'types/design/types';

export const getSelectionGroups = (nodes: TSceneNode[]): TSceneNode[][] => {
  const groups = new Map<string | null, TSceneNode[]>();

  nodes.forEach((node) => {
    const key = node.parentId ?? null;
    const group = groups.get(key);

    if (group) {
      group.push(node);
    } else {
      groups.set(key, [node]);
    }
  });

  return [...groups.values()];
};
