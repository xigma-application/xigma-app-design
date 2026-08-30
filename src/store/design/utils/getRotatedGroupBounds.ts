// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeWorldCorners } from './getNodeWorldCorners';
import { rotatePoint } from 'utils/math/rotatePoint';

const ORIGIN: TPoint = { x: 0, y: 0 };

export const getRotatedGroupBounds = (children: TSceneNode[], rotation: number): TDraftRect => {
  const localCorners = children.flatMap((child) => getNodeWorldCorners(child).map((corner) => rotatePoint(corner, ORIGIN, -rotation)));
  const xs = localCorners.map((corner) => corner.x);
  const ys = localCorners.map((corner) => corner.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const width = Math.max(...xs) - minX;
  const height = Math.max(...ys) - minY;
  const worldCenter = rotatePoint({ x: minX + width / 2, y: minY + height / 2 }, ORIGIN, rotation);

  return { height, width, x: worldCenter.x - width / 2, y: worldCenter.y - height / 2 };
};
