// types
import { SizingMode } from 'types/design/enums';
import { TBoxSceneNode, TSceneNode } from 'types/design/types';

// utils
import { isManagedLayoutFrame } from 'utils/canvas/signals/isManagedLayoutFrame';

export const canFillAxis = (node: TBoxSceneNode, nodesById: Record<string, TSceneNode>, axis: 'height' | 'width'): boolean => {
  const parent = node.parentId ? nodesById[node.parentId] : undefined;

  if (isManagedLayoutFrame(parent)) {
    return ((axis === 'width' ? parent.widthSizingMode : parent.heightSizingMode) ?? SizingMode.fixed) !== SizingMode.hug;
  }

  return false;
};
