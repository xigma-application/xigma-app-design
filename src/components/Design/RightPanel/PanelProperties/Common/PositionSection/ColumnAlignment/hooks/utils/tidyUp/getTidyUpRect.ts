// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';

export const getTidyUpRect = (node: TSceneNode): TDraftRect => {
  const bounds = getRotatedNodeBounds(node);

  return { height: Math.round(bounds.height), width: Math.round(bounds.width), x: Math.round(bounds.x), y: Math.round(bounds.y) };
};
