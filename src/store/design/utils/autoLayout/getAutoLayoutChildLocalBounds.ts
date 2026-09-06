// store
import { getRotatedNodeBounds } from '../getRotatedNodeBounds';

// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

export const getAutoLayoutChildLocalBounds = (node: TSceneNode, frameRotation: number): TDraftRect => {
  if (frameRotation !== 0 && 'rotation' in node) {
    return getRotatedNodeBounds({ ...node, rotation: node.rotation - frameRotation } as TSceneNode);
  }

  return getRotatedNodeBounds(node);
};
