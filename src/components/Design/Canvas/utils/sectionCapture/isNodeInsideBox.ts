// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeAxisAlignedBounds } from 'store/design/utils/getNodeAxisAlignedBounds';

export const isNodeInsideBox = (node: TSceneNode, box: TDraftRect): boolean => {
  const bounds = getNodeAxisAlignedBounds(node);
  return (
    bounds.x >= box.x && bounds.y >= box.y && bounds.x + bounds.width <= box.x + box.width && bounds.y + bounds.height <= box.y + box.height
  );
};
