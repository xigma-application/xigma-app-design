// types
import { TSceneNode } from 'types/design/types';

export const getStrokePadding = (node: TSceneNode): number => {
  if ('strokeColor' in node && node.strokeColor && node.strokeWidth) {
    return node.strokeWidth / 2;
  }

  return 0;
};
