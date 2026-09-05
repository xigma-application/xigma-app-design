// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from './getRotatedNodeBounds';

export const getNodesBoundingBox = (nodes: TSceneNode[]): TDraftRect => {
  const bounds = nodes.map(getRotatedNodeBounds);
  const minX = Math.min(...bounds.map((bound) => bound.x));
  const minY = Math.min(...bounds.map((bound) => bound.y));
  const maxX = Math.max(...bounds.map((bound) => bound.x + bound.width));
  const maxY = Math.max(...bounds.map((bound) => bound.y + bound.height));

  return { height: maxY - minY, width: maxX - minX, x: minX, y: minY };
};
