// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from './getRotatedNodeBounds';

export const getSelectionBounds = (nodes: TSceneNode[]): TDraftRect => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const bound = getRotatedNodeBounds(node);

    minX = Math.min(minX, bound.x);
    minY = Math.min(minY, bound.y);
    maxX = Math.max(maxX, bound.x + bound.width);
    maxY = Math.max(maxY, bound.y + bound.height);
  });

  return { height: maxY - minY, width: maxX - minX, x: minX, y: minY };
};
