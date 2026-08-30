// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { flipTextPoint } from '../text/flipTextPoint';
import { getTextPathSampler } from '../text/pathSampler/getTextPathSampler';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getNearestPathOffsetAtPoint = (point: TPoint, box: TEditingTextBox, pathNode?: TSceneNode): number => {
  const center: TPoint = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const unrotated = rotatePoint(point, center, -box.rotation);
  const localPoint = flipTextPoint(unrotated, box);
  const sampler = getTextPathSampler(box, pathNode);
  const nearest = sampler.nearestOffsetAtPoint(localPoint);

  return nearest.offset;
};
