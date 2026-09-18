// types
import { TSceneNode } from 'types/design/types';

// utils
import { getStrokePaddings } from 'utils/design/stroke/getStrokePaddings';

export const getStrokePadding = (node: TSceneNode): number => {
  const { bottom, left, right, top } = getStrokePaddings(node);

  return Math.max(bottom, left, right, top);
};
