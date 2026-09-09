// types
import { TSceneNode } from 'types/design/types';

// utils
import { getStrokeAlignInset } from 'utils/canvas/getStrokeAlignInset/getStrokeAlignInset';

export const getStrokePadding = (node: TSceneNode): number => {
  if ('strokeColor' in node && node.strokeColor && node.strokeWidth) {
    const strokeAlign = 'strokeAlign' in node ? node.strokeAlign : undefined;
    return getStrokeAlignInset(node.strokeWidth, strokeAlign).outer;
  }

  return 0;
};
