// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeBounds } from './getNodeBounds';
import { getStrokePadding } from './getNodeAtPoint/getStrokePadding';

export const getSelectionOutlineBounds = (node: TSceneNode): TDraftRect => {
  const { height, width, x, y } = getNodeBounds(node);
  const padding = getStrokePadding(node);

  return { height: height + padding * 2, width: width + padding * 2, x: x - padding, y: y - padding };
};
